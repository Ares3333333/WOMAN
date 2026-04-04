"use client";

import { useRouter } from "next/navigation";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";
import { detectCrisisLanguage } from "@/lib/safety/crisis";

export function CrisisGuardTextarea(props: TextareaProps) {
  const router = useRouter();
  return (
    <Textarea
      {...props}
      onBlur={(e) => {
        if (detectCrisisLanguage(e.target.value)) {
          router.push("/crisis");
          return;
        }
        props.onBlur?.(e);
      }}
    />
  );
}
