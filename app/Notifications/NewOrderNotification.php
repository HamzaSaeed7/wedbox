<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOrderNotification extends Notification
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
        $serviceTitle = $order->service?->title ?? 'your service';
        $customerName = $order->user?->profile?->first_name
            ? trim("{$order->user->profile->first_name} {$order->user->profile->last_name}")
            : ($order->user?->name ?? 'A customer');
        $amount       = '€' . number_format((float) $order->price, 0);
        $date         = $order->deliver_date
            ? $order->deliver_date->format('d-m-Y')
            : now()->format('d-m-Y');
        $dashboardUrl = url('/dashboard/vendor/orders');

        return (new MailMessage)
            ->subject("New booking request — {$serviceTitle}")
            ->greeting("You have a new booking request!")
            ->line("{$customerName} has placed a reservation for **{$serviceTitle}**.")
            ->line("**Date:** {$date}  |  **Amount:** {$amount}")
            ->action('Review & Respond', $dashboardUrl)
            ->line('Please approve or reject the booking from your vendor dashboard.')
            ->line('Thank you for being part of Wedbi!')
            ->salutation('Warm regards, The Wedbi Team');
    }
}
