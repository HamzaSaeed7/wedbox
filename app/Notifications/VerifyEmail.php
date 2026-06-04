<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerifyEmail extends Notification
{
    use Queueable;

    public string $verifyUrl;

    public function __construct(string $verifyUrl)
    {
        $this->verifyUrl = $verifyUrl;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verify your WedBox email address')
            ->greeting('Welcome to WedBox!')
            ->line('Thanks for signing up. Please click the button below to verify your email address.')
            ->action('Verify Email Address', $this->verifyUrl)
            ->line('This link will expire in 60 minutes.')
            ->line('If you did not create an account, you can safely ignore this email.');
    }
}
