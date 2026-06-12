<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly Order $order) {}

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $order        = $this->order;
        $status       = $order->status; // 'approved' or 'rejected'
        $serviceTitle = $order->service?->title ?? 'your booking';
        $vendorName   = $order->vendor?->vendorProfile?->business_name
            ?? $order->vendor?->name
            ?? 'The vendor';
        $dashboardUrl = url('/dashboard/buyer');

        if ($status === 'approved') {
            return (new MailMessage)
                ->subject("Your booking has been approved — {$serviceTitle}")
                ->greeting('Great news! Your booking was approved 🎉')
                ->line("{$vendorName} has approved your reservation for **{$serviceTitle}**.")
                ->line('You can view the full details in your dashboard.')
                ->action('View My Bookings', $dashboardUrl)
                ->line('Congratulations on your upcoming wedding!')
                ->salutation('Warm regards, The WedBox Team');
        }

        return (new MailMessage)
            ->subject("Your booking was not accepted — {$serviceTitle}")
            ->greeting('Booking update')
            ->line("{$vendorName} was unable to accept your reservation for **{$serviceTitle}** at this time.")
            ->line('You can browse other vendors and make a new booking from the WedBox marketplace.')
            ->action('Find Another Vendor', url('/search'))
            ->line('We\'re sorry for the inconvenience. The WedBox team is here to help!')
            ->salutation('Warm regards, The WedBox Team');
    }
}
