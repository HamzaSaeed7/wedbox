<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use App\Notifications\NewOrderNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $items = Order::with('service.category')
            ->where('user_id', $request->user()->id)
            ->where('status', 'in_cart')
            ->get();

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'service_id'    => 'required|exists:services,id',
            'order_type'    => 'required|string',
            'deliver_date'  => 'nullable|date',
            'note'          => 'nullable|string',
            'price'         => 'nullable|numeric|min:0',
            'order_details' => 'nullable|array',
        ]);

        $service = Service::findOrFail($data['service_id']);

        $order = DB::transaction(function () use ($data, $service, $request) {
            $order = Order::create([
                'user_id'      => $request->user()->id,
                'service_id'   => $data['service_id'],
                'vendor_id'    => $service->vendor_id,
                'price'        => $data['price'] ?? 0,
                'deliver_date' => $data['deliver_date'] ?? null,
                'note'         => $data['note'] ?? null,
                'order_type'   => $data['order_type'],
                'status'       => 'in_cart',
            ]);

            $this->createOrderDetail($order, $data['order_details'] ?? []);

            return $order;
        });

        return response()->json($order->load('service.category'), 201);
    }

    public function confirm(Request $request)
    {
        // Fetch the cart items before updating so we can notify each vendor
        $cartOrders = Order::with('service', 'user.profile', 'vendor')
            ->where('user_id', $request->user()->id)
            ->where('status', 'in_cart')
            ->get();

        if ($cartOrders->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty.'], 422);
        }

        Order::whereIn('id', $cartOrders->pluck('id'))->update(['status' => 'pending']);

        // Notify each vendor — one email per order
        foreach ($cartOrders as $order) {
            $vendor = $order->vendor ?? User::find($order->vendor_id);
            if ($vendor) {
                $order->status = 'pending'; // reflect updated status in the notification
                try {
                    $vendor->notify(new NewOrderNotification($order));
                } catch (\Throwable) {
                    // Never let a mail failure break the confirmation response
                }
            }
        }

        return response()->json(['message' => 'Reservation confirmed.', 'count' => $cartOrders->count()]);
    }

    public function destroy(Request $request, Order $order)
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $order->delete();
        return response()->json(null, 204);
    }

    private function createOrderDetail(Order $order, array $d): void
    {
        $modelMap = [
            'venue'         => \App\Models\OrderVenue::class,
            'catering'      => \App\Models\OrderCatering::class,
            'florist'       => \App\Models\OrderFlorist::class,
            'car-hire'      => \App\Models\OrderCarHire::class,
            'photography'   => \App\Models\OrderPhotography::class,
            'music'         => \App\Models\OrderMusic::class,
            'bride-dress'   => \App\Models\OrderBrideDress::class,
            'groom-suite'   => \App\Models\OrderGroomSuite::class,
            'best-man'      => \App\Models\OrderBestManSuit::class,
            'bridesmaid'    => \App\Models\OrderBridesmaid::class,
            'flower-girl'   => \App\Models\OrderFlowerGirl::class,
            'yacht'         => \App\Models\OrderYachtHire::class,
            'bachelor'      => \App\Models\OrderBachelor::class,
            'bachelorette'  => \App\Models\OrderBachelorette::class,
            'hotel'         => \App\Models\OrderHotel::class,
            'bar'           => \App\Models\OrderBar::class,
            'makeup'        => \App\Models\OrderMakeup::class,
            'hair'          => \App\Models\OrderHair::class,
            'invitation'    => \App\Models\OrderInvitation::class,
        ];

        $modelClass = $modelMap[$order->order_type] ?? null;
        if (!$modelClass) return;

        // Map frontend payload keys → DB column names for each order type
        $mapped = match ($order->order_type) {
            'venue'       => ['no_of_people'    => $d['people']    ?? null],
            'catering'    => ['adults'           => $d['adults']    ?? null,
                              'kids'             => $d['kids']      ?? null],
            'florist'     => ['type'             => $d['type']      ?? null,
                              'package_id'       => $d['pkg']       ?? null,
                              'selected_colors'  => $d['colors']    ?? [],
                              'selected_designs' => $d['designs']   ?? [],
                              'selected_addons'  => $d['addons']    ?? []],
            'car-hire'    => ['hire_hour_id'     => $d['hours']     ?? null,
                              'pickup_location'  => $d['pickup']['loc']   ?? null,
                              'dropoff_location' => $d['dropoff']['loc']  ?? null,
                              'selected_addons'  => $d['addons']    ?? []],
            'photography' => ['package_id'       => $d['pkg']       ?? null,
                              'selected_addons'  => $d['addons']    ?? []],
            'music'       => ['hours'            => $d['hours']     ?? null,
                              'entrance_song'    => $d['entrance']  ?? null,
                              'first_dance_song' => $d['firstDance'] ?? null],
            'bride-dress' => ['type'             => $d['type']      ?? null,
                              'sizes'            => $d['sizes']     ?? [],
                              'extras'           => $d['extras']    ?? [],
                              'fitting_1'        => $d['fit1']      ?? null,
                              'fitting_2'        => $d['fit2']      ?? null],
            'groom-suite',
            'best-man'    => ['type'             => $d['type']      ?? null,
                              'jacket_size'      => $d['jacket']    ?? null,
                              'vest_size'        => $d['vest']      ?? null,
                              'shirt_size'       => $d['shirt']     ?? null,
                              'bottom_size'      => $d['bottom']    ?? null,
                              'fitting_1'        => $d['fit1']      ?? null,
                              'fitting_2'        => $d['fit2']      ?? null],
            'bridesmaid'  => ['sizes'            => $d['sizes']     ?? []],
            'flower-girl' => ['dress_size'       => $d['age']       ?? null,
                              'quantity'         => $d['qty']       ?? null],
            'yacht'       => ['hire_hour_id'     => $d['hours']     ?? null],
            'bachelor'    => ['num_boys'         => $d['people']    ?? null,
                              'hours'            => $d['hours']     ?? null,
                              'includes'         => $d['includes']  ?? []],
            'bachelorette'=> ['num_girls'        => $d['people']    ?? null,
                              'hours'            => $d['hours']     ?? null,
                              'includes'         => $d['includes']  ?? []],
            'hotel'       => ['room_id'          => $d['roomId']    ?? null,
                              'arrival_date'     => $d['arrival']   ?? null,
                              'departure_date'   => $d['departure'] ?? null,
                              'selected_facilities' => $d['facilities'] ?? []],
            'bar'         => ['people'           => $d['people']    ?? null,
                              'hours'            => $d['hours']     ?? null,
                              'address'          => $d['address']   ?? null,
                              'selected_menus'   => $d['menus']     ?? []],
            'makeup'      => ['selected_packages' => $d['selected'] ?? []],
            'hair'        => ['selected_packages' => $d['selected'] ?? []],
            'invitation'  => ['quantity'         => $d['quantity']        ?? 1,
                              'needed_by'        => $d['needed_by']       ?? null,
                              'event_date'       => $d['event_date']      ?? null,
                              'selected_types'   => $d['types']           ?? [],
                              'design_id'        => $d['design_id']       ?? null,
                              'selected_addons'  => $d['addons']          ?? [],
                              'invitation_text'  => $d['invitation_text'] ?? null,
                              'custom_design_url'=> $d['custom_design_url'] ?? null],
            default       => $d,
        };

        try {
            $modelClass::create(array_merge(['order_id' => $order->id], $mapped));
        } catch (\Throwable $e) {
            // Detail is supplementary — never let it break the cart item creation
            \Illuminate\Support\Facades\Log::warning('Order detail save failed', [
                'order_id' => $order->id, 'type' => $order->order_type, 'error' => $e->getMessage(),
            ]);
        }
    }
}
