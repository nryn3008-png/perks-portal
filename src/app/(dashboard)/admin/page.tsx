import { redirect } from 'next/navigation';

/**
 * Admin index page - redirects to perks management
 */
export default function AdminPage() {
  redirect('/admin/perks');
}
