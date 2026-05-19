import type { DialogueLine } from "@/lib/store";

type PortraitProps = {
  type?: DialogueLine["portrait"];
};

export function Portrait({ type = "byte" }: PortraitProps) {
  if (type === "sign") {
    return (
      <div className="portrait-pixel portrait-sign" aria-hidden>
        <span>?</span>
      </div>
    );
  }

  if (type === "bot") {
    return (
      <div className="portrait-pixel portrait-bot" aria-hidden>
        <span>BB</span>
      </div>
    );
  }

  return (
    <div className="portrait-pixel portrait-byte" aria-hidden>
      <span>B</span>
    </div>
  );
}
