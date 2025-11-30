import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export async function handleSignOut(router: AppRouterInstance) {
  try {
    const response = await fetch("/api/actions/auth/signout", {
      method: "POST",
    });
    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        router.push("/");
        router.refresh();
      }
    }
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

export async function handleCopyUrl(
  url: string,
  setCopied: (copied: boolean) => void
) {
  try {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (error) {
    console.error("Failed to copy URL:", error);
  }
}
