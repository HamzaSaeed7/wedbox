<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $conversations = Conversation::with('customer.profile', 'vendor.vendorProfile', 'service')
            ->where('customer_id', $user->id)
            ->orWhere('vendor_id', $user->id)
            ->withCount(['messages as unread_count' => function ($q) use ($user) {
                $q->where('sender_id', '!=', $user->id)->whereNull('read_at');
            }])
            ->orderByDesc('last_message_at')
            ->get();

        return response()->json($conversations);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vendor_id'  => 'required|exists:users,id',
            'service_id' => 'nullable|exists:services,id',
        ]);

        $conversation = Conversation::firstOrCreate([
            'customer_id' => $request->user()->id,
            'vendor_id'   => $data['vendor_id'],
            'service_id'  => $data['service_id'] ?? null,
        ]);

        return response()->json($conversation->load('customer.profile', 'vendor.vendorProfile', 'service'), 201);
    }

    public function messages(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        if ($conversation->customer_id !== $user->id && $conversation->vendor_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(
            $conversation->messages()->with('sender.profile')->latest()->paginate(50)
        );
    }

    public function sendMessage(Request $request, Conversation $conversation)
    {
        $user = $request->user();
        if ($conversation->customer_id !== $user->id && $conversation->vendor_id !== $user->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $data = $request->validate(['body' => 'required|string']);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $user->id,
            'body'            => $data['body'],
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json($message->load('sender.profile'), 201);
    }
}
