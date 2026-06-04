<?php

namespace App\Observers;

use App\Models\Review;

class ReviewObserver
{
    public function saved(Review $review): void
    {
        $this->recalculate($review);
    }

    public function deleted(Review $review): void
    {
        $this->recalculate($review);
    }

    private function recalculate(Review $review): void
    {
        $service = $review->service;
        $service->rating = $service->reviews()->avg('rating') ?? 0;
        $service->review_count = $service->reviews()->count();
        $service->save();
    }
}
