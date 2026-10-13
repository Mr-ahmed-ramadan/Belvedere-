import { requireAdmin } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { SETTING_KEYS } from "@/lib/constants";
import { PageHeader } from "@/components/ui";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  await requireAdmin();
  const s = await getSettings([
    SETTING_KEYS.WHATSAPP_RESIDENTS,
    SETTING_KEYS.WHATSAPP_BOARD,
    SETTING_KEYS.HERO_IMAGE,
    SETTING_KEYS.CONTACT_EMAIL,
  ]);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="WhatsApp group links and the sign-in page photo."
      />
      <div className="card max-w-2xl">
        <SettingsForm
          defaults={{
            whatsappResidents: s[SETTING_KEYS.WHATSAPP_RESIDENTS] ?? "",
            whatsappBoard: s[SETTING_KEYS.WHATSAPP_BOARD] ?? "",
            heroImage: s[SETTING_KEYS.HERO_IMAGE] ?? "",
            contactEmail: s[SETTING_KEYS.CONTACT_EMAIL] ?? "",
          }}
        />
      </div>
    </div>
  );
}
