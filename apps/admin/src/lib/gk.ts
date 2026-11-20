import { supabase } from "@/integrations/data/client";

export interface Coach {
  active: boolean;
  email: string;
  group_rate: number;
  id: string;
  individual_rate: number;
  name: string;
  whatsapp_phone: string | null;
}

export type EnrollmentType = "Base" | "Pro" | "Supreme";

export const ENROLLMENT_TYPES: EnrollmentType[] = ["Base", "Pro", "Supreme"];

export type AthleteType = "Individual" | "Group";

export const ATHLETE_TYPES: AthleteType[] = ["Individual", "Group"];

export interface Student {
  athlete_type: AthleteType;
  enroll_date: string | null;
  enrollment_type: EnrollmentType | null;
  group_id: string | null;
  group_ids: string[] | null;
  id: string;
  level: string | null;
  name: string;
  parent_contact: string | null;
  technical_notes: string | null;
}

export interface Group {
  active: boolean;
  coach_id: string | null;
  day_of_week: number | null;
  end_time: string | null;
  field_id: string | null;
  id: string;
  level: string | null;
  name: string;
  notes: string | null;
  start_time: string | null;
}

export function formatMonthYear(iso: string) {
  return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
  });
}

export function trainingHours(start: string, end: string) {
  const h = (new Date(end).getTime() - new Date(start).getTime()) / 3_600_000;
  return Math.max(h, 0);
}

export type TrainingStatus = "Scheduled" | "Completed" | "Cancelled";
export type PaymentStatus = "Pending" | "Paid";
export type InvoiceStatus = "Invoiced" | "No invoice";
export type TrainingType = "Individual" | "Group";

export interface Training {
  club_id?: string | null;
  coach_id: string | null;
  end_date: string;
  field: string | null;
  group_id: string | null;
  id: string;
  invoice: InvoiceStatus | null;
  notes: string | null;
  payment_status: PaymentStatus;
  series_id?: string | null;
  start_date: string;
  status: TrainingStatus;
  student_id: string | null;
  tax_id: string | null;
  type: TrainingType;
}

export interface NotificationSettings {
  daily_send_time: string;
  from_email: string | null;
  id: string;
  preferred_channel: "Email" | "WhatsApp" | "Both";
  resend_api_key: string | null;
  timezone: string;
  whatsapp_api_key: string | null;
  whatsapp_phone_id: string | null;
}

export interface ReminderRecord {
  channel: string;
  coach_id: string | null;
  detail: string | null;
  id: string;
  sent_at: string;
  status: string;
  training_id: string | null;
}

function unwrap<T>({
  data,
  error,
}: {
  data: T | null;
  error: { message: string } | null;
}): T {
  if (error) {
    throw new Error(error.message);
  }
  return data as T;
}

export const listCoaches = async () =>
  unwrap<Coach[]>(
    (await supabase.from("coaches").select("*").order("name")) as never
  );

export const listStudents = async () =>
  unwrap<Student[]>(
    (await supabase.from("students").select("*").order("name")) as never
  );

export const listTrainings = async () =>
  unwrap<Training[]>(
    (await supabase.from("trainings").select("*").order("start_date")) as never
  );

export const getNotificationSettings = async () =>
  unwrap<NotificationSettings>(
    (await supabase
      .from("notification_settings")
      .select("*")
      .limit(1)
      .single()) as never
  );

export const listReminders = async () =>
  unwrap<ReminderRecord[]>(
    (await supabase
      .from("reminder_history")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(100)) as never
  );

export interface MonthlyFee {
  amount: number | null;
  club_id?: string | null;
  id: string;
  invoice: InvoiceStatus | null;
  month: string;
  notes: string | null;
  payment_status: PaymentStatus;
  student_id: string | null;
  tax_id: string | null;
}

export const listMonthlyFees = async () =>
  unwrap<MonthlyFee[]>(
    (await supabase
      .from("monthly_fees")
      .select("*")
      .order("month", { ascending: false })) as never
  );

export const TRAINING_TYPES: TrainingType[] = ["Individual", "Group"];

export function formatMonth(iso: string) {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString("pt-PT", {
    month: "long",
    year: "numeric",
  });
}

export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export const TRAINING_STATUSES: TrainingStatus[] = [
  "Scheduled",
  "Completed",
  "Cancelled",
];
export const PAYMENT_STATUSES: PaymentStatus[] = ["Pending", "Paid"];
export const INVOICE_STATUSES: InvoiceStatus[] = ["Invoiced", "No invoice"];

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
}

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export interface Availability {
  coach_id: string;
  day_of_week: number;
  end_time: string;
  id: string;
  notes: string | null;
  start_time: string;
}

export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const listAvailability = async () =>
  unwrap<Availability[]>(
    (await supabase
      .from("availability")
      .select("*")
      .order("day_of_week")
      .order("start_time")) as never
  );

export function formatTimeShort(time: string) {
  return time.slice(0, 5);
}

export type TransactionType = "Income" | "Expense";

export interface Transaction {
  amount: number;
  automatic: boolean;
  category: string;
  coach_id: string | null;
  date: string;
  description: string | null;
  id: string;
  training_id: string | null;
  type: TransactionType;
}

export const TRANSACTION_TYPES: TransactionType[] = ["Income", "Expense"];

export const TRANSACTION_CATEGORIES = [
  "Individual training",
  "Monthly fee",
  "Coach salary",
  "Equipment",
  "Field rental",
  "Other",
] as const;

export const listTransactions = async () =>
  unwrap<Transaction[]>(
    (await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })) as never
  );

/**
 * Format an integer-cents amount (D1 storage format) as a pt-PT euro string.
 * The client receives money as integer cents from `/api/pg`; this helper
 * divides by 100 before formatting.
 */
export function formatEuros(cents: number) {
  return new Intl.NumberFormat("pt-PT", {
    currency: "EUR",
    style: "currency",
  }).format(cents / 100);
}

/**
 * Convert integer cents (DB format) to a decimal-euro string suitable for a
 * `<input type="number" step="0.01">`. Returns `""` when the value is null/0
 * so the input shows its placeholder.
 */
export function centsToInputValue(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || cents === 0) {
    return "";
  }
  return (cents / 100).toFixed(2).replace(/\.00$/u, "");
}

/**
 * Parse a decimal-euro string from a form input into integer cents (DB format).
 * Returns `null` for empty or invalid input.
 */
export function inputValueToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    return null;
  }
  return Math.round(n * 100);
}

export interface Field {
  active: boolean;
  address: string | null;
  id: string;
  name: string;
  notes: string | null;
}

export interface FieldAvailability {
  day_of_week: number;
  end_time: string;
  field_id: string;
  id: string;
  notes: string | null;
  start_time: string;
}

export const listFields = async () =>
  unwrap<Field[]>(
    (await supabase.from("fields").select("*").order("name")) as never
  );

export const listFieldAvailability = async () =>
  unwrap<FieldAvailability[]>(
    (await supabase
      .from("field_availability")
      .select("*")
      .order("day_of_week")
      .order("start_time")) as never
  );

export function minutesFromTime(time: string) {
  const [h, m] = time.slice(0, 5).split(":");
  return Number(h) * 60 + Number(m);
}

export function timeFromMinutes(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export interface Club {
  active: boolean;
  coach_id: string | null;
  contact: string | null;
  day_of_week: number | null;
  email: string | null;
  end_time: string | null;
  field_id: string | null;
  id: string;
  monthly_fee: number;
  name: string;
  notes: string | null;
  start_time: string | null;
  tax_id: string | null;
}

export const listClubs = async () =>
  unwrap<Club[]>(
    (await supabase.from("clubs").select("*").order("name")) as never
  );

export interface ClubSession {
  club_id: string;
  day_of_week: number;
  end_time: string;
  id: string;
  start_time: string;
}

export const listClubSessions = async () =>
  unwrap<ClubSession[]>(
    (await supabase
      .from("club_sessions")
      .select("*")
      .order("day_of_week")
      .order("start_time")) as never
  );

export const listGroups = async () =>
  unwrap<Group[]>(
    (await supabase.from("groups").select("*").order("name")) as never
  );

/**
 * Finds the individual trainings of the same recurring series.
 * Uses series_id when present; for older trainings falls back to
 * student + coach + day of week + hour.
 * Completed trainings are never included (they protect the accounts).
 */
export async function findSeries(
  training: Training,
  mode: "upcoming" | "all"
): Promise<string[]> {
  let list: Training[] = [];
  if (training.series_id) {
    const { data, error } = await supabase
      .from("trainings")
      .select("*")
      .eq("series_id", training.series_id);
    if (error) {
      throw new Error(error.message);
    }
    list = (data ?? []) as unknown as Training[];
  } else if (training.student_id) {
    const { data, error } = await supabase
      .from("trainings")
      .select("*")
      .eq("type", "Individual")
      .eq("student_id", training.student_id);
    if (error) {
      throw new Error(error.message);
    }
    const ref = new Date(training.start_date);
    list = ((data ?? []) as unknown as Training[]).filter((t) => {
      const d = new Date(t.start_date);
      return (
        t.coach_id === training.coach_id &&
        d.getDay() === ref.getDay() &&
        d.getHours() === ref.getHours() &&
        d.getMinutes() === ref.getMinutes()
      );
    });
  } else {
    list = [training];
  }
  const startRef = new Date(training.start_date).getTime();
  return list
    .filter((t) => t.id === training.id || t.status !== "Completed")
    .filter(
      (t) => mode === "all" || new Date(t.start_date).getTime() >= startRef
    )
    .map((t) => t.id);
}
