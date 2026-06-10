import { supabase } from "../../../shared/libs/supabaseClient";
import { db } from "../../../database/db";
import {
  getRequirePasswordKey,
  getSalaryLockKey,
} from "../../../shared/constants/storageKeys";

async function getRequiredCloudUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Bạn cần đăng nhập tài khoản cloud trước");
  }

  return user.id;
}

function getDeletedAt(item: any) {
  return item.deletedAt || item.deleted_at || null;
}

export async function pushWalletsToCloud(localUserId: string) {
  const cloudUserId = await getRequiredCloudUserId();

  const wallets = await db.wallets
    .where("userId")
    .equals(localUserId)
    .toArray();

  const rows = wallets.map((item: any) => ({
    id: item.id,
    user_id: cloudUserId,
    name: item.name,
    type: item.type,
    balance: item.balance,
    is_default: item.isDefault,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    deleted_at: getDeletedAt(item),
  }));

  console.log("wallet rows sync:", rows);

  if (rows.length === 0) return;

  const { error } = await supabase.from("wallets").upsert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

export async function pushCategoriesToCloud(localUserId: string) {
  const cloudUserId = await getRequiredCloudUserId();

  const categories = await db.categories
    .where("userId")
    .equals(localUserId)
    .toArray();

  const rows = categories.map((item: any) => ({
    id: item.id,
    user_id: cloudUserId,
    name: item.name,
    type: item.type,
    icon: item.icon || null,
    color: item.color || null,
    is_default: item.isDefault || false,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    deleted_at: getDeletedAt(item),
  }));

  console.log("category rows sync:", rows);

  if (rows.length === 0) return;

  const { error } = await supabase.from("categories").upsert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

export async function pushTransactionsToCloud(localUserId: string) {
  const cloudUserId = await getRequiredCloudUserId();

  const transactions = await db.transactions
    .where("userId")
    .equals(localUserId)
    .toArray();

  const rows = transactions.map((item: any) => ({
    id: item.id,
    user_id: cloudUserId,
    wallet_id: item.walletId,
    category_id: item.categoryId || null,
    type: item.type,
    debt_type: item.debtType || null,
    amount: item.amount,
    note: item.note || null,
    description: item.description || null,
    partner: item.partner || null,
    date: item.date,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    deleted_at: getDeletedAt(item),
  }));

  console.log("transaction rows sync:", rows);

  if (rows.length === 0) return;

  const { error } = await supabase.from("transactions").upsert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

export async function pushSavingTransactionsToCloud(localUserId: string) {
  const cloudUserId = await getRequiredCloudUserId();

  const savingTransactions = await db.savingTransactions
    .where("userId")
    .equals(localUserId)
    .toArray();

  const rows = savingTransactions.map((item: any) => ({
    id: item.id,
    user_id: cloudUserId,
    wallet_id: item.walletId,
    type: item.type,
    amount: item.amount,
    note: item.note || null,
    description: item.description || null,
    date: item.date,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    deleted_at: getDeletedAt(item),
  }));

  console.log("saving transaction rows sync:", rows);

  if (rows.length === 0) return;

  const { error } = await supabase.from("saving_transactions").upsert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

export async function pushSavingGoalsToCloud(localUserId: string) {
  const cloudUserId = await getRequiredCloudUserId();

  const goals = await db.savingGoals
    .where("userId")
    .equals(localUserId)
    .toArray();

  const rows = goals.map((item: any) => ({
    id: item.id,
    user_id: cloudUserId,
    name: item.name,
    target_amount: item.targetAmount,
    current_amount: item.currentAmount || 0,
    deadline: item.deadline || null,
    note: item.note || null,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    deleted_at: getDeletedAt(item),
  }));

  console.log("saving goal rows sync:", rows);

  if (rows.length === 0) return;

  const { error } = await supabase.from("saving_goals").upsert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

export async function pushSalaryRecordsToCloud(localUserId: string) {
  const cloudUserId = await getRequiredCloudUserId();

  const records = await db.salaryRecords
    .where("userId")
    .equals(localUserId)
    .toArray();

  const rows = records.map((item: any) => ({
    id: item.id,
    user_id: cloudUserId,
    type: item.type,
    amount: item.amount,
    month: item.month,
    received_date: item.receivedDate,
    company: item.company || null,
    note: item.note || null,
    description: item.description || null,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    deleted_at: getDeletedAt(item),
  }));

  console.log("salary record rows sync:", rows);

  if (rows.length === 0) return;

  const { error } = await supabase.from("salary_records").upsert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

export async function pushNotificationsToCloud(localUserId: string) {
  const cloudUserId = await getRequiredCloudUserId();

  const notifications = await db.notifications
    .where("userId")
    .equals(localUserId)
    .toArray();

  const rows = notifications.map((item: any) => ({
    id: item.id,
    user_id: cloudUserId,
    type: item.type,
    title: item.title,
    description: item.description,
    is_read: item.isRead || false,
    action_url: item.actionUrl || null,
    created_at: item.createdAt,
    deleted_at: getDeletedAt(item),
  }));

  console.log("notification rows sync:", rows);

  if (rows.length === 0) return;

  const { error } = await supabase.from("notifications").upsert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

export async function pushAppSettingsToCloud(localUserId: string) {
  const cloudUserId = await getRequiredCloudUserId();

  const now = new Date().toISOString();

  const requirePasswordValue =
    localStorage.getItem(getRequirePasswordKey(localUserId)) || "false";

  const salaryLockValue =
    localStorage.getItem(getSalaryLockKey(localUserId)) || "false";

  const rows = [
    {
      id: `app_setting_${cloudUserId}_require_password`,
      user_id: cloudUserId,
      key: "require_password",
      value: requirePasswordValue,
      created_at: now,
      updated_at: now,
    },
    {
      id: `app_setting_${cloudUserId}_salary_lock`,
      user_id: cloudUserId,
      key: "salary_lock",
      value: salaryLockValue,
      created_at: now,
      updated_at: now,
    },
  ];

  console.log("app setting rows sync:", rows);

  const { error } = await supabase.from("app_settings").upsert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

export async function pushAllLocalDataToCloud(localUserId: string) {
  await pushWalletsToCloud(localUserId);
  await pushCategoriesToCloud(localUserId);
  await pushTransactionsToCloud(localUserId);
  await pushSavingTransactionsToCloud(localUserId);
  await pushSavingGoalsToCloud(localUserId);
  await pushSalaryRecordsToCloud(localUserId);
  await pushNotificationsToCloud(localUserId);
  await pushAppSettingsToCloud(localUserId);

  await cleanExtraCloudData(localUserId);
}

export async function compareLocalAndCloudData(localUserId: string) {
  const cloudUserId = await getRequiredCloudUserId();

  const localWallets = await db.wallets
    .where("userId")
    .equals(localUserId)
    .toArray();

  const localCategories = await db.categories
    .where("userId")
    .equals(localUserId)
    .toArray();

  const localTransactions = await db.transactions
    .where("userId")
    .equals(localUserId)
    .toArray();

  const localSavingTransactions = await db.savingTransactions
    .where("userId")
    .equals(localUserId)
    .toArray();

  const localSavingGoals = await db.savingGoals
    .where("userId")
    .equals(localUserId)
    .toArray();

  const localSalaryRecords = await db.salaryRecords
    .where("userId")
    .equals(localUserId)
    .toArray();

  const localNotifications = await db.notifications
    .where("userId")
    .equals(localUserId)
    .toArray();

  const wallets = await compareTable({
    tableName: "wallets",
    cloudUserId,
    localIds: localWallets.map((item) => item.id),
  });

  const categories = await compareTable({
    tableName: "categories",
    cloudUserId,
    localIds: localCategories.map((item) => item.id),
  });

  const transactions = await compareTable({
    tableName: "transactions",
    cloudUserId,
    localIds: localTransactions.map((item) => item.id),
  });

  const savingTransactions = await compareTable({
    tableName: "saving_transactions",
    cloudUserId,
    localIds: localSavingTransactions.map((item) => item.id),
  });

  const savingGoals = await compareTable({
    tableName: "saving_goals",
    cloudUserId,
    localIds: localSavingGoals.map((item) => item.id),
  });

  const salaryRecords = await compareTable({
    tableName: "salary_records",
    cloudUserId,
    localIds: localSalaryRecords.map((item) => item.id),
  });

  const notifications = await compareTable({
    tableName: "notifications",
    cloudUserId,
    localIds: localNotifications.map((item) => item.id),
  });

  const appSettings = await compareTable({
    tableName: "app_settings",
    cloudUserId,
    localIds: [
      `app_setting_${cloudUserId}_require_password`,
      `app_setting_${cloudUserId}_salary_lock`,
    ],
  });

  return {
    wallets,
    categories,
    transactions,
    savingTransactions,
    savingGoals,
    salaryRecords,
    notifications,
    appSettings,
  };
}

async function compareTable(params: {
  tableName: string;
  cloudUserId: string;
  localIds: string[];
}) {
  const { tableName, cloudUserId, localIds } = params;

  const { data, error } = await supabase
    .from(tableName)
    .select("id")
    .eq("user_id", cloudUserId);

  if (error) {
    throw new Error(error.message);
  }

  const cloudIds = (data || []).map((item: any) => item.id);

  const missingOnCloud = localIds.filter((id) => !cloudIds.includes(id));
  const extraOnCloud = cloudIds.filter((id) => !localIds.includes(id));

  return {
    local: localIds.length,
    cloud: cloudIds.length,
    matched:
      localIds.length === cloudIds.length &&
      missingOnCloud.length === 0 &&
      extraOnCloud.length === 0,
    missingOnCloud,
    extraOnCloud,
  };
}

export async function syncAllLocalDataToCloudAndCleanExtra(
  localUserId: string,
) {
  await pushAllLocalDataToCloud(localUserId);
  return compareLocalAndCloudData(localUserId);
}

export async function cleanExtraCloudData(localUserId: string) {
  const cloudUserId = await getRequiredCloudUserId();

  const localWallets = await db.wallets
    .where("userId")
    .equals(localUserId)
    .toArray();

  const localCategories = await db.categories
    .where("userId")
    .equals(localUserId)
    .toArray();

  const localTransactions = await db.transactions
    .where("userId")
    .equals(localUserId)
    .toArray();

  const localSavingTransactions = await db.savingTransactions
    .where("userId")
    .equals(localUserId)
    .toArray();

  const localSavingGoals = await db.savingGoals
    .where("userId")
    .equals(localUserId)
    .toArray();

  const localSalaryRecords = await db.salaryRecords
    .where("userId")
    .equals(localUserId)
    .toArray();

  const localNotifications = await db.notifications
    .where("userId")
    .equals(localUserId)
    .toArray();

  await deleteExtraRowsFromCloud({
    tableName: "transactions",
    cloudUserId,
    localIds: localTransactions.map((item) => item.id),
  });

  await deleteExtraRowsFromCloud({
    tableName: "saving_transactions",
    cloudUserId,
    localIds: localSavingTransactions.map((item) => item.id),
  });

  await deleteExtraRowsFromCloud({
    tableName: "saving_goals",
    cloudUserId,
    localIds: localSavingGoals.map((item) => item.id),
  });

  await deleteExtraRowsFromCloud({
    tableName: "salary_records",
    cloudUserId,
    localIds: localSalaryRecords.map((item) => item.id),
  });

  await deleteExtraRowsFromCloud({
    tableName: "notifications",
    cloudUserId,
    localIds: localNotifications.map((item) => item.id),
  });

  await deleteExtraRowsFromCloud({
    tableName: "app_settings",
    cloudUserId,
    localIds: [
      `app_setting_${cloudUserId}_require_password`,
      `app_setting_${cloudUserId}_salary_lock`,
    ],
  });

  await deleteExtraRowsFromCloud({
    tableName: "wallets",
    cloudUserId,
    localIds: localWallets.map((item) => item.id),
  });

  await deleteExtraRowsFromCloud({
    tableName: "categories",
    cloudUserId,
    localIds: localCategories.map((item) => item.id),
  });
}

async function deleteExtraRowsFromCloud(params: {
  tableName: string;
  cloudUserId: string;
  localIds: string[];
}) {
  const { tableName, cloudUserId, localIds } = params;

  const { data, error } = await supabase
    .from(tableName)
    .select("id")
    .eq("user_id", cloudUserId);

  if (error) {
    throw new Error(error.message);
  }

  const cloudIds = (data || []).map((item: any) => item.id);
  const extraIds = cloudIds.filter((id) => !localIds.includes(id));

  if (extraIds.length === 0) return;

  console.log(`Xóa dữ liệu dư trên cloud - ${tableName}:`, extraIds);

  const { error: deleteError } = await supabase
    .from(tableName)
    .delete()
    .eq("user_id", cloudUserId)
    .in("id", extraIds);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
}

export async function pullAllCloudDataToLocal(localUserId: string) {
  const cloudUserId = await getRequiredCloudUserId();

  const [
    walletsResult,
    categoriesResult,
    transactionsResult,
    savingTransactionsResult,
    savingGoalsResult,
    salaryRecordsResult,
    notificationsResult,
    appSettingsResult,
  ] = await Promise.all([
    supabase.from("wallets").select("*").eq("user_id", cloudUserId),
    supabase.from("categories").select("*").eq("user_id", cloudUserId),
    supabase.from("transactions").select("*").eq("user_id", cloudUserId),
    supabase.from("saving_transactions").select("*").eq("user_id", cloudUserId),
    supabase.from("saving_goals").select("*").eq("user_id", cloudUserId),
    supabase.from("salary_records").select("*").eq("user_id", cloudUserId),
    supabase.from("notifications").select("*").eq("user_id", cloudUserId),
    supabase.from("app_settings").select("*").eq("user_id", cloudUserId),
  ]);

  if (walletsResult.error) throw new Error(walletsResult.error.message);
  if (categoriesResult.error) throw new Error(categoriesResult.error.message);
  if (transactionsResult.error) {
    throw new Error(transactionsResult.error.message);
  }
  if (savingTransactionsResult.error) {
    throw new Error(savingTransactionsResult.error.message);
  }
  if (savingGoalsResult.error) throw new Error(savingGoalsResult.error.message);
  if (salaryRecordsResult.error) {
    throw new Error(salaryRecordsResult.error.message);
  }
  if (notificationsResult.error) {
    throw new Error(notificationsResult.error.message);
  }
  if (appSettingsResult.error) {
    throw new Error(appSettingsResult.error.message);
  }

  const cloudWallets = walletsResult.data || [];
  const cloudCategories = categoriesResult.data || [];
  const cloudTransactions = transactionsResult.data || [];
  const cloudSavingTransactions = savingTransactionsResult.data || [];
  const cloudSavingGoals = savingGoalsResult.data || [];
  const cloudSalaryRecords = salaryRecordsResult.data || [];
  const cloudNotifications = notificationsResult.data || [];
  const cloudAppSettings = appSettingsResult.data || [];

  await db.transaction(
    "rw",
    db.wallets,
    db.categories,
    db.transactions,
    db.savingTransactions,
    db.savingGoals,
    db.salaryRecords,
    db.notifications,
    async () => {
      await db.wallets.where("userId").equals(localUserId).delete();
      await db.categories.where("userId").equals(localUserId).delete();
      await db.transactions.where("userId").equals(localUserId).delete();
      await db.savingTransactions.where("userId").equals(localUserId).delete();
      await db.savingGoals.where("userId").equals(localUserId).delete();
      await db.salaryRecords.where("userId").equals(localUserId).delete();
      await db.notifications.where("userId").equals(localUserId).delete();

      await db.wallets.bulkPut(
        cloudWallets
          .filter((item: any) => !item.deleted_at)
          .map((item: any) => ({
            id: item.id,
            userId: localUserId,
            name: item.name,
            type: item.type,
            balance: Number(item.balance || 0),
            isDefault: Boolean(item.is_default),
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          })),
      );

      await db.categories.bulkPut(
        cloudCategories
          .filter((item: any) => !item.deleted_at)
          .map((item: any) => ({
            id: item.id,
            userId: localUserId,
            name: item.name,
            type: item.type,
            icon: item.icon || "✨",
            color: item.color || "#895BFF",
            isDefault: Boolean(item.is_default),
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          })),
      );

      await db.transactions.bulkPut(
        cloudTransactions
          .filter((item: any) => !item.deleted_at)
          .map((item: any) => ({
            id: item.id,
            userId: localUserId,
            walletId: item.wallet_id,
            categoryId: item.category_id || undefined,
            type: item.type,
            debtType: item.debt_type || undefined,
            amount: Number(item.amount || 0),
            note: item.note || undefined,
            description: item.description || undefined,
            partner: item.partner || undefined,
            date: item.date,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          })),
      );

      await db.savingTransactions.bulkPut(
        cloudSavingTransactions
          .filter((item: any) => !item.deleted_at)
          .map((item: any) => ({
            id: item.id,
            userId: localUserId,
            walletId: item.wallet_id,
            type: item.type,
            amount: Number(item.amount || 0),
            note: item.note || undefined,
            description: item.description || undefined,
            date: item.date,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          })),
      );

      await db.savingGoals.bulkPut(
        cloudSavingGoals
          .filter((item: any) => !item.deleted_at)
          .map((item: any) => ({
            id: item.id,
            userId: localUserId,
            name: item.name,
            targetAmount: Number(item.target_amount || 0),
            currentAmount: Number(item.current_amount || 0),
            deadline: item.deadline || undefined,
            note: item.note || undefined,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          })),
      );

      await db.salaryRecords.bulkPut(
        cloudSalaryRecords
          .filter((item: any) => !item.deleted_at)
          .map((item: any) => ({
            id: item.id,
            userId: localUserId,
            type: item.type,
            amount: Number(item.amount || 0),
            month: item.month,
            receivedDate: item.received_date,
            company: item.company || undefined,
            note: item.note || undefined,
            description: item.description || undefined,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          })),
      );

      await db.notifications.bulkPut(
        cloudNotifications
          .filter((item: any) => !item.deleted_at)
          .map((item: any) => ({
            id: item.id,
            userId: localUserId,
            type: item.type,
            title: item.title,
            description: item.description,
            actionUrl: item.action_url || undefined,
            isRead: Boolean(item.is_read),
            createdAt: item.created_at,
          })),
      );
    },
  );

  const requirePasswordSetting = cloudAppSettings.find(
    (item: any) => item.key === "require_password",
  );

  if (requirePasswordSetting) {
    localStorage.setItem(
      getRequirePasswordKey(localUserId),
      requirePasswordSetting.value,
    );
  }

  const salaryLockSetting = cloudAppSettings.find(
    (item: any) => item.key === "salary_lock",
  );

  if (salaryLockSetting) {
    localStorage.setItem(getSalaryLockKey(localUserId), salaryLockSetting.value);
  }

  return {
    wallets: cloudWallets.filter((item: any) => !item.deleted_at).length,
    categories: cloudCategories.filter((item: any) => !item.deleted_at).length,
    transactions: cloudTransactions.filter((item: any) => !item.deleted_at)
      .length,
    savingTransactions: cloudSavingTransactions.filter(
      (item: any) => !item.deleted_at,
    ).length,
    savingGoals: cloudSavingGoals.filter((item: any) => !item.deleted_at)
      .length,
    salaryRecords: cloudSalaryRecords.filter((item: any) => !item.deleted_at)
      .length,
    notifications: cloudNotifications.filter((item: any) => !item.deleted_at)
      .length,
    appSettings: cloudAppSettings.length,
  };
}

function getAppBaseUrl() {
  return `${window.location.origin}${import.meta.env.BASE_URL}`;
}

export async function sendCloudResetPasswordEmail(email: string) {
  const redirectTo = `${getAppBaseUrl()}cloud-reset-password`;

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateCloudPassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}