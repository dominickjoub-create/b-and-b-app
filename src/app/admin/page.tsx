import Link from 'next/link';
import { requireAdmin } from '@/lib/access';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Read-only reporting for the course owner: sales, revenue, students,
// recent transactions, and per-student watch progress. Refunds happen
// in PayFast's own dashboard, deliberately not here.
export default async function AdminPage() {
  await requireAdmin();
  const admin = createAdminClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { data: completedPayments },
    { count: studentCount },
    { count: lessonCount },
    { data: recentPayments },
    { data: students },
    { data: progress },
  ] = await Promise.all([
    admin
      .from('payments')
      .select('amount_gross, amount_net, created_at')
      .eq('status', 'COMPLETE'),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('lessons').select('*', { count: 'exact', head: true }),
    admin
      .from('payments')
      .select('created_at, m_payment_id, pf_payment_id, amount_gross, status, user_id')
      .order('created_at', { ascending: false })
      .limit(20),
    admin
      .from('profiles')
      .select('id, email, full_name, has_access, created_at')
      .order('created_at', { ascending: false }),
    admin.from('lesson_progress').select('user_id, completed'),
  ]);

  const paid = completedPayments ?? [];
  const totalRevenue = paid.reduce((s, p) => s + Number(p.amount_gross ?? 0), 0);
  const monthRevenue = paid
    .filter((p) => new Date(p.created_at) >= startOfMonth)
    .reduce((s, p) => s + Number(p.amount_gross ?? 0), 0);

  const emailById = new Map((students ?? []).map((s) => [s.id, s.email]));
  const completedByUser = new Map<string, number>();
  for (const p of progress ?? []) {
    if (p.completed) {
      completedByUser.set(p.user_id, (completedByUser.get(p.user_id) ?? 0) + 1);
    }
  }

  const fmtR = (n: number) =>
    `R${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtDate = (d: string) =>
    new Date(d).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <div>
      <div className="admin-top">
        <h1>Sales dashboard</h1>
        <Link href="/admin/content" className="button">
          ⬆ Upload videos &amp; book
        </Link>
      </div>
      <div className="stats-grid">
        <div className="stat">
          <div className="value">{paid.length}</div>
          <div className="label">Total sales</div>
        </div>
        <div className="stat">
          <div className="value">{fmtR(totalRevenue)}</div>
          <div className="label">Total revenue</div>
        </div>
        <div className="stat">
          <div className="value">{fmtR(monthRevenue)}</div>
          <div className="label">Revenue this month</div>
        </div>
        <div className="stat">
          <div className="value">{studentCount ?? 0}</div>
          <div className="label">Registered students</div>
        </div>
      </div>

      <h2>Recent transactions</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Amount</th>
              <th>Status</th>
              <th>PayFast ID</th>
            </tr>
          </thead>
          <tbody>
            {(recentPayments ?? []).map((p) => (
              <tr key={p.m_payment_id}>
                <td>{fmtDate(p.created_at)}</td>
                <td>{(p.user_id && emailById.get(p.user_id)) ?? '—'}</td>
                <td>{p.amount_gross != null ? fmtR(Number(p.amount_gross)) : '—'}</td>
                <td>{p.status}</td>
                <td>{p.pf_payment_id ?? '—'}</td>
              </tr>
            ))}
            {(recentPayments ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  No transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2>Students &amp; progress</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Signed up</th>
              <th>Paid?</th>
              <th>Lessons completed</th>
            </tr>
          </thead>
          <tbody>
            {(students ?? []).map((s) => (
              <tr key={s.id}>
                <td>
                  {s.full_name || '—'}
                  <div className="muted">{s.email}</div>
                </td>
                <td>{fmtDate(s.created_at)}</td>
                <td>{s.has_access ? '✅' : '—'}</td>
                <td>
                  {completedByUser.get(s.id) ?? 0} / {lessonCount ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">
        Refunds are issued from the PayFast merchant dashboard, not from here.
      </p>
    </div>
  );
}
