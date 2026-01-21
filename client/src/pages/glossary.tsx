import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Percent, Users, DollarSign, AlertTriangle, Target, Calculator } from "lucide-react";

const GLOSSARY_ITEMS = [
  {
    term: "GGR (Gross Gaming Revenue)",
    shortTerm: "GGR",
    icon: DollarSign,
    category: "Revenue",
    description: "Bruttoindtægt fra spil. Det er den samlede sum af alle væddemål minus alle gevinster udbetalt til spillere.",
    formula: "GGR = Total Indsats - Total Gevinster",
    example: "Hvis spillere satser 100.000 DKK og vinder 92.000 DKK tilbage, er GGR = 8.000 DKK",
    importance: "Vigtig for at måle casinoets samlede indtjening før driftsomkostninger."
  },
  {
    term: "NGR (Net Gaming Revenue)",
    shortTerm: "NGR",
    icon: TrendingUp,
    category: "Revenue",
    description: "Nettoindtægt fra spil. GGR minus bonusser, jackpotbidrag og affiliate-kommissioner.",
    formula: "NGR = GGR - Bonusser - Jackpotbidrag - Affiliate Kommission",
    example: "Hvis GGR er 8.000 DKK og der gives 1.500 DKK i bonusser, er NGR = 6.500 DKK",
    importance: "Den reelle indtægt casinoet tjener efter alle spillerelaterede omkostninger."
  },
  {
    term: "RTP (Return to Player)",
    shortTerm: "RTP",
    icon: Percent,
    category: "Game Metrics",
    description: "Procentdel af indsatser der returneres til spillerne over tid. Et spil med 96% RTP betaler i gennemsnit 96 DKK tilbage for hver 100 DKK satset.",
    formula: "RTP = (Total Udbetalt / Total Indsat) × 100%",
    example: "Et slot-spil med 96% RTP returnerer i gennemsnit 96 kr. for hver 100 kr. satset.",
    importance: "Hjælper med at forstå spillets volatilitet og forventet afkast."
  },
  {
    term: "House Edge",
    shortTerm: "House Edge",
    icon: Target,
    category: "Game Metrics",
    description: "Casinoets matematiske fordel over spilleren. Det modsatte af RTP.",
    formula: "House Edge = 100% - RTP",
    example: "Hvis RTP er 96%, er House Edge 4%",
    importance: "Viser casinoets forventede profit per spil over lang sigt."
  },
  {
    term: "ARPU (Average Revenue Per User)",
    shortTerm: "ARPU",
    icon: Users,
    category: "Player Metrics",
    description: "Gennemsnitlig indtægt per aktiv bruger i en given periode.",
    formula: "ARPU = Total NGR / Antal Aktive Spillere",
    example: "Med NGR på 100.000 DKK og 500 aktive spillere: ARPU = 200 DKK",
    importance: "Måler værdien af hver spiller og hjælper med budgettering."
  },
  {
    term: "LTV (Lifetime Value)",
    shortTerm: "LTV",
    icon: Calculator,
    category: "Player Metrics",
    description: "Den forventede samlede værdi en spiller genererer i hele deres levetid som kunde.",
    formula: "LTV = ARPU × Gennemsnitlig Spillerlevetid",
    example: "Hvis ARPU er 200 DKK/måned og spillere er aktive i 12 måneder: LTV = 2.400 DKK",
    importance: "Afgørende for at bestemme hvor meget der kan bruges på kundeerhvervelse."
  },
  {
    term: "Risiko Niveau",
    shortTerm: "Risk Level",
    icon: AlertTriangle,
    category: "Compliance",
    description: "Klassificering af spillere baseret på adfærd, indsatsmønstre og potentielle problemer.",
    formula: "Automatisk beregnet baseret på adfærdsanalyse",
    example: "Low (normal), Medium (overvågning), High (intervention påkrævet), VIP (højværdi kunde)",
    importance: "Kritisk for ansvarligt spil og compliance med gambling-regulativer."
  }
];

const CATEGORIES = ["Revenue", "Game Metrics", "Player Metrics", "Compliance"];

export default function GlossaryPage() {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Casino Metrics Forklaret
          </h1>
          <p className="text-muted-foreground mt-2">
            En komplet guide til de vigtigste nøgletal og begreber i casino analytics.
          </p>
        </div>

        {CATEGORIES.map((category) => (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">{category}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {GLOSSARY_ITEMS.filter(item => item.category === category).map((item) => (
                <Card key={item.term} className="hover:shadow-lg transition-shadow" data-testid={`card-glossary-${item.shortTerm.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{item.term}</CardTitle>
                          <Badge variant="outline" className="mt-1">{item.shortTerm}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    
                    <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Formel</span>
                        <p className="text-sm font-mono text-primary">{item.formula}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Eksempel</span>
                        <p className="text-sm">{item.example}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-border">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Hvorfor det er vigtigt</span>
                      <p className="text-sm text-muted-foreground">{item.importance}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
