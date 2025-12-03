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
  setCopied: (copied: boolean) => void,
  hostName?: string,
  year?: number
) {
  try {
    // Create a catchy gen-z invite message
    const yearText = year || new Date().getFullYear();
    let message: string;

    if (hostName) {
      // Use possessive form: "Sarah's" or "Sarah invited you to drop a memory on her..."
      message = `${hostName} wants you to drop a memory on their ${yearText} Friendship Wrapped! 🎉\n\n${url}`;
    } else {
      message = `Drop a memory on my ${yearText} Friendship Wrapped! 🎉\n\n${url}`;
    }

    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (error) {
    console.error("Failed to copy URL:", error);
  }
}
