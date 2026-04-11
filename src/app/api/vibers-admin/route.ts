import { getAdminFirestore } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  const secret = process.env.VIBERS_ADMIN_SECRET;
  if (!secret || request.headers.get("x-vibers-admin-secret") !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getAdminFirestore();
    const [usersSnap, productsSnap, ordersSnap] = await Promise.all([
      db.collection("users").count().get(),
      db.collection("products").count().get(),
      db.collection("orders").where("status", "==", "paid").count().get(),
    ]);

    return Response.json({
      projectId: "goodzz",
      projectName: "GOODZZ",
      stats: {
        totalUsers: usersSnap.data().count ?? 0,
        contentCount: productsSnap.data().count ?? 0,
        mau: ordersSnap.data().count ?? 0,
        recentSignups: 0,
      },
      recentActivity: [],
      health: "healthy",
    });
  } catch {
    return Response.json({
      projectId: "goodzz",
      projectName: "GOODZZ",
      stats: { totalUsers: 0, contentCount: 0, mau: 0, recentSignups: 0 },
      recentActivity: [],
      health: "error",
    });
  }
}

export async function POST(request: Request) {
  const secret = process.env.VIBERS_ADMIN_SECRET;
  if (!secret || request.headers.get("x-vibers-admin-secret") !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ error: "Not implemented" }, { status: 501 });
}
