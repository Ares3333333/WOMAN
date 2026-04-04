import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/section-header";
import { GradientCard } from "@/components/gradient-card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getPageI18n } from "@/lib/i18n/server";

export default async function LandingPage() {
  const { t, dict } = await getPageI18n();
  const landing = dict.landing as Record<string, unknown>;
  const categories = (landing.categories as string[]) ?? [];
  const signatureBullets = (landing.signatureBullets as string[]) ?? [];

  return (
    <div className="min-h-dvh bg-gradient-mesh">
      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-6">
        <span className="font-display text-xl tracking-tight">{t("common.brand")}</span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" asChild>
            <Link href="/sign-in">{t("landing.signIn")}</Link>
          </Button>
          <Button asChild>
            <Link href="/age-gate">{t("landing.startFree")}</Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 pb-20 pt-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-radial-soft" />
        <div className="relative mx-auto max-w-3xl animate-fade-in text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            {t("landing.eyebrow")}
          </p>
          <h1 className="mt-4 font-display text-4xl font-medium leading-tight tracking-tight text-foreground md:text-5xl">
            {t("landing.heroTitle")}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">{t("landing.heroBody")}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/age-gate">{t("landing.beginFree")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/crisis">{t("landing.crisisResources")}</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">{t("landing.wellnessOnly")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <SectionHeader
          eyebrow={t("landing.whyEyebrow")}
          title={t("landing.whyTitle")}
          description={t("landing.whyDesc")}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { title: t("landing.why1Title"), body: t("landing.why1Body") },
            { title: t("landing.why2Title"), body: t("landing.why2Body") },
            { title: t("landing.why3Title"), body: t("landing.why3Body") },
          ].map((b) => (
            <GradientCard key={b.title} gradientKey="rose-plum">
              <h3 className="font-display text-lg">{b.title}</h3>
              <p className="mt-2 text-sm opacity-80">{b.body}</p>
            </GradientCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <SectionHeader
          eyebrow={t("landing.howEyebrow")}
          title={t("landing.howTitle")}
          description={t("landing.howDesc")}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { step: t("landing.how1Step"), title: t("landing.how1Title"), body: t("landing.how1Body") },
            { step: t("landing.how2Step"), title: t("landing.how2Title"), body: t("landing.how2Body") },
            { step: t("landing.how3Step"), title: t("landing.how3Title"), body: t("landing.how3Body") },
          ].map((s) => (
            <Card key={s.step} className="border-border/70 bg-card/70">
              <CardHeader>
                <p className="text-xs font-medium text-primary">{s.step}</p>
                <CardTitle className="text-base">{s.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{s.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <SectionHeader eyebrow={t("landing.testimonialsEyebrow")} title={t("landing.testimonialsTitle")} />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[t("landing.testimonial1"), t("landing.testimonial2"), t("landing.testimonial3")].map((q) => (
            <Card key={q} className="bg-card/60">
              <CardContent className="pt-6 text-sm italic text-muted-foreground">{q}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <SectionHeader eyebrow={t("landing.categoriesEyebrow")} title={t("landing.categoriesTitle")} />
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c}
              className="rounded-full border border-border/80 bg-card/70 px-4 py-2 text-sm text-foreground/85"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <GradientCard gradientKey="dusk">
          <SectionHeader title={t("landing.pricingTitle")} description={t("landing.pricingBody")} />
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/age-gate">{t("landing.pricingCtaFree")}</Link>
            </Button>
            <Button asChild variant="outline" className="border-charcoal/20 bg-white/30">
              <Link href="/sign-up">{t("landing.pricingCtaAccount")}</Link>
            </Button>
          </div>
        </GradientCard>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <SectionHeader
          eyebrow={t("landing.signatureEyebrow")}
          title={t("landing.signatureTitle")}
          description={t("landing.signatureBody")}
        />
        <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
          {signatureBullets.map((line) => (
            <li key={line} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/sign-in">{t("landing.signatureCta")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/sign-in?callbackUrl=/app/learn">{t("landing.signatureCtaPrograms")}</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <SectionHeader title={t("landing.faqTitle")} />
        <div className="mt-8 space-y-6 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">{t("landing.faqTherapyQ")}</p>
            <p className="mt-1">{t("landing.faqTherapyA")}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t("landing.faqExplicitQ")}</p>
            <p className="mt-1">{t("landing.faqExplicitA")}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t("landing.faqCrisisQ")}</p>
            <p className="mt-1">
              {t("landing.faqCrisisA")}{" "}
              <Link href="/crisis" className="text-primary underline">
                {t("landing.faqCrisisLink")}
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-xl px-4 pb-24 text-center">
        <p className="text-sm text-muted-foreground">{t("landing.newsletterTitle")}</p>
        <p className="mt-2 text-xs text-muted-foreground">{t("landing.newsletterHint")}</p>
        <div className="mt-4 flex gap-2">
          <input
            readOnly
            placeholder="you@email.com"
            className="h-11 flex-1 rounded-xl border border-border bg-card/80 px-4 text-sm"
          />
          <Button type="button" disabled variant="secondary">
            {t("landing.notifyMe")}
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t("common.brand")} · {t("landing.footerWellness")}{" "}
        <Link href="/privacy" className="underline">
          {t("landing.footerPrivacy")}
        </Link>
        {" · "}
        <Link href="/crisis" className="underline">
          {t("landing.footerCrisis")}
        </Link>
      </footer>
    </div>
  );
}
