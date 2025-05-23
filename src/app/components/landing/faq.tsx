import { Section } from "@/components/ui/section";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Link from "next/link";
import { ReactNode } from "react";

interface FAQItemProps {
  question: string;
  answer: ReactNode;
  value?: string;
}

interface FAQProps {
  title?: string;
  items?: FAQItemProps[] | false;
  className?: string;
}

export default function Faq({
  title = "Domande frequenti",
  items = [
    {
      question: "MaturaMate è davvero gratuito?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            Sì! Puoi iniziare subito con il piano Free, che ti dà accesso a
            esercizi e simulazioni ufficiali limitate. Nessuna carta di credito
            richiesta.
          </p>
        </>
      ),
    },
    {
      question: "Come funziona il piano Premium?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            Il piano Premium ti offre accesso illimitato a molte funzionalità:
            simulazioni, esercizi avanzati e piano di studio personalizzato.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            Inoltre, il piano offre numerosi vantaggi anche per quanto riguarda
            l'AI. Non solo ti permette di accedere a conversazioni giornaliere
            con l'AI base fino a 10× più estese rispetto al piano Free, ma ti
            offre anche l'accesso all'AI avanzata (Reasoning Model) per
            spiegazioni più dettagliate.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            Puoi scegliere tra abbonamento mensile o trimestrale. Nessun rinnovo
            automatico obbligatorio.
          </p>
        </>
      ),
    },
    {
      question: "Cosa fa l’AI all’interno di MaturaMate?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Ti aiuta a capire gli esercizi passo dopo passo, genera risposte su
            misura, e ti aiuta nella creazione di un piano di studio in base ai
            tuoi punti deboli.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Se non capisci una soluzione, ti basterà interagire con l'AI per
            ricevere una spiegazione dettagliata. È disponibile sia per aiutarti
            con gli esercizi, sia con le simulazioni.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Nel piano Premium usa un modello AI avanzato per spiegazioni più
            profonde.
          </p>
        </>
      ),
    },
    {
      question: "Le simulazioni sono quelle ufficiali del Ministero?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Sì! Abbiamo raccolto tutte le simulazioni ufficiali degli anni
            precedenti e le mettiamo a disposizione. La simulazione più remota
            che offriamo è quella del 2001.
          </p>
        </>
      ),
    },
    {
      question: "Come faccio a sapere se sto migliorando?",
      answer: (
        <p className="text-muted-foreground mb-4 max-w-[580px]">
          Nel piano Premium, il tuo piano di studio si aggiorna in base ai
          risultati. Vedi i tuoi progressi per argomento, con grafici chiari e
          consigli pratici su dove concentrarti.
        </p>
      ),
    },
    {
      question: "Posso cancellare l’abbonamento quando voglio?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Certo. Nessun vincolo. Puoi gestire il tuo abbonamento dalla
            dashboard e interromperlo in qualsiasi momento senza penali.
          </p>
        </>
      ),
    },
    {
      question: "Posso usare MaturaMate anche da smartphone?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Sì! La piattaforma è ottimizzata per mobile, tablet e desktop. Puoi
            studiare ovunque tu sia. È un segreto, ma a breve sarà disponibile
            anche l'app!
          </p>
        </>
      ),
    },
  ],
  className,
}: FAQProps) {
  return (
    <Section id="faq" className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-8">
        <h2 className="text-center text-3xl font-semibold sm:text-5xl">
          {title}
        </h2>
        {items !== false && items.length > 0 && (
          <Accordion type="single" collapsible className="w-full max-w-[800px]">
            {items.map((item, index) => (
              <AccordionItem
                key={index}
                value={item.value || `item-${index + 1}`}
              >
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </Section>
  );
}
