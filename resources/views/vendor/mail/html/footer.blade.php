<tr>
<td>
<table class="footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
<tr>
<td class="content-cell" align="center">
<p style="color:#a1a1aa;font-size:13px;margin:0 0 6px;">
    {{ Illuminate\Mail\Markdown::parse($slot) }}
</p>
<p style="color:#c4c4cc;font-size:12px;margin:0;">
    &copy; {{ date('Y') }} Wedbi &mdash; Cyprus Wedding Marketplace<br>
    <a href="{{ config('app.url') }}" style="color:#79cdd0;text-decoration:none;">wedbi.io</a>
    &nbsp;&middot;&nbsp;
    <a href="{{ config('app.url') }}/contact" style="color:#a1a1aa;text-decoration:none;">Contact</a>
</p>
</td>
</tr>
</table>
</td>
</tr>
