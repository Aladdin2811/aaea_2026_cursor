import supabase, { supabaseUrl } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  getUserProfileForUser,
  type UserProfileRow,
} from "./apiUserProfiles";

export type SessionUserPack = {
  user: User | null;
  profile: UserProfileRow | null;
};

export async function getSessionUserWithProfile(): Promise<SessionUserPack> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return { user: null, profile: null };

  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  const user = data.user ?? null;
  if (!user) return { user: null, profile: null };

  try {
    const profile = await getUserProfileForUser(user.id);
    return { user, profile };
  } catch {
    return { user, profile: null };
  }
}

type SignupParams = {
  fullName: string;
  roleId: number;
  email: string;
  password: string;
};

export async function signup({ fullName, roleId, email, password }: SignupParams) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
        role_id: roleId,
        avatar: "",
      },
    },
  });

  if (error) throw new Error(error.message);

  return data;
}

type LoginParams = {
  email: string;
  password: string;
};

export async function login({ email, password }: LoginParams) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);

  return data;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;

  const { data, error } = await supabase.auth.getUser();

  if (error) throw new Error(error.message);
  return data?.user ?? null;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

type UpdateUserParams = {
  password?: string;
  fullName?: string;
  avatar?: File;
};

export async function updateCurrentUser({ password, fullName, avatar }: UpdateUserParams) {
  let updateData: { password?: string; data?: { fullName: string } } | undefined;
  if (password) updateData = { password };
  if (fullName) updateData = { data: { fullName } };

  const { data, error } = await supabase.auth.updateUser(updateData ?? {});

  if (error) throw new Error(error.message);

  if (fullName && data?.user?.id) {
    void supabase
      .from("user_profiles")
      .update({ full_name: fullName })
      .eq("id", data.user.id)
      .then(({ error: pe }) => {
        if (pe) console.warn("user_profiles sync:", pe.message);
      });
  }

  if (!avatar) return data;

  const fileName = `avatar-${data.user.id}-${Math.random()}`;

  const { error: storageError } = await supabase.storage
    .from("avatars")
    .upload(fileName, avatar);

  if (storageError) throw new Error(storageError.message);

  const { data: updatedUser, error: error2 } = await supabase.auth.updateUser({
    data: {
      avatar: `${supabaseUrl}/storage/v1/object/public/avatars/${fileName}`,
    },
  });

  if (error2) throw new Error(error2.message);
  return updatedUser;
}
