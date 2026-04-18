/**
 * app/loading.tsx · 全局默认 loading fallback
 *
 * Next.js App Router 约定：同级和下级路由在 SSR/streaming 时若未定义自己的
 * loading.tsx，就用这个占位。UI.md 13.1 的 3 个浅粉小圆点 loading 效果。
 */

export default function RootLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary-hover [animation-delay:-0.15s]" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary-strong" />
      </div>
    </div>
  );
}
