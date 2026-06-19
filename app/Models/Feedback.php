<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    // Laravel pluralises "Feedback" to the uncountable "feedback"; the table
    // created by the migration is "feedbacks", so pin it explicitly.
    protected $table = 'feedbacks';

    protected $fillable = ['user_id', 'feedback_text', 'experience'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
