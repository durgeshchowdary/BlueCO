import RoleShell from '../../../components/RoleShell';
import SubscribeButton from '../../../components/SubscribeButton';

export default function Page() {
  return (
    <RoleShell role="academy_admin" title="Subscription">
      <div className="mb-6">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-200">Academy billing</p>
        <h1 className="mt-3 text-3xl font-black md:text-5xl">Upgrade to Pro</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
          Activate monthly SaaS access for your academy using Razorpay Standard Checkout.
        </p>
      </div>

      <SubscribeButton />
    </RoleShell>
  );
}
