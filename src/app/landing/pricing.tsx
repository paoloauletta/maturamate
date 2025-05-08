import { Section } from "@/components/ui/section";
import { User } from "lucide-react";
import {
  PricingColumn,
  PricingColumnProps,
} from "@/components/ui/pricing-column";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Label } from "@/components/ui/label";

interface PricingProps {
  title?: string | false;
  description?: string | false;
  className?: string;
}

export default function Pricing({
  title = "Sblocca la tua preparazione ideale.",
  description = "Scegli il piano che meglio si adatta di più alle tue esigenze. Nessun costo nascosto. Solo ciò che ti serve per superare al meglio la maturità.",
  className = "",
}: PricingProps) {
  const [isQuarterly, setIsQuarterly] = useState(false);

  const monthlyPrice = 14.99;
  const quarterlyPrice = 39.99;

  const plans: PricingColumnProps[] = [
    {
      name: "Free",
      description: "Per chi vuole iniziare a prepararsi con calma",
      price: 0,
      priceNote: "Per sempre gratuito",
      cta: {
        variant: "glow",
        label: "Inizia gratis",
        href: "/",
      },
      features: [
        "Accesso limitato a simulazioni ufficiali",
        "Esercizi giornalieri",
        "Piano base generato dall'AI (interazioni limitate)",
        "Possibilità di passare al Premium in ogni momento",
      ],
      variant: "default",
    },
    {
      name: "Premium",
      icon: <User className="size-4" />,
      description: "Per chi sceglie di prepararsi in modo completo",
      price: isQuarterly ? quarterlyPrice : monthlyPrice,
      priceNote: isQuarterly
        ? "Pagamento ogni 3 mesi. Annulla in ogni momento."
        : "Pagamento mensile. Annulla in ogni momento.",
      cta: {
        variant: "default",
        label: "Passa al Premium",
        href: "/",
      },
      features: [
        `Accesso illimitato a tutte le simulazioni ufficiali`,
        `Esercizi senza limiti per ogni argomento`,
        `Piano di studio personalizzato su misura`,
        `AI avanzata (Reasoning model) per spiegazioni più approfondite e complete`,
        `Conversazioni giornaliere con l'AI base fino a 10× più estese`,
        `Accesso prioritario a nuove funzionalità`,
      ],
      variant: "glow-brand",
    },
  ];

  return (
    <Section id="prezzi" className={cn(className)}>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-12">
        {(title || description) && (
          <div className="flex flex-col items-center gap-4 px-4 text-center sm:gap-8">
            {title && (
              <h2 className="text-3xl leading-tight font-semibold sm:text-5xl sm:leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-md text-muted-foreground max-w-[600px] font-medium sm:text-xl">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="flex items-center justify-center gap-2 mb-4 w-full">
          <Label
            htmlFor="pricing-toggle"
            className={!isQuarterly ? "font-medium" : "text-muted-foreground"}
          >
            Monthly
          </Label>
          <Switch
            id="pricing-toggle"
            checked={isQuarterly}
            onCheckedChange={setIsQuarterly}
          />
          <Label
            htmlFor="pricing-toggle"
            className={isQuarterly ? "font-medium" : "text-muted-foreground"}
          >
            3-Month
          </Label>
          {/* {isQuarterly && (
            <span className="text-xs font-medium bg-brand/10 text-brand px-2 py-1 rounded-full ml-2">
              Risparmia il{" "}
              {Math.round((monthlyPrice * 3) / quarterlyPrice) * 10}%
            </span>
          )} */}
        </div>

        <div className="max-w-container mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2">
          {plans.map((plan) => (
            <PricingColumn
              key={plan.name}
              name={plan.name}
              icon={plan.icon}
              description={plan.description}
              price={plan.price}
              priceNote={plan.priceNote}
              cta={plan.cta}
              features={plan.features}
              variant={plan.variant}
              className={plan.className}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
