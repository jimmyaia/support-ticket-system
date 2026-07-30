import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, HeadphonesIcon, Search } from "lucide-react";
import { toast } from "sonner";

interface Props {
  params: { ticketNumber: string };
}

export default function TicketConfirmation({ params }: Props) {
  const { ticketNumber } = params;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ticketNumber);
    toast.success("Ticket number copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <HeadphonesIcon className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground tracking-tight">SupportDesk</span>
            </div>
          </Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="font-display text-3xl font-medium text-foreground mb-3">Ticket Submitted</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Your support ticket has been received. Save your ticket number — you'll need it to check your status.
        </p>

        <div className="bg-white rounded-xl border border-border/60 shadow-sm p-6 mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-3">Your Ticket Number</p>
          <div className="flex items-center justify-center gap-3">
            <span className="font-mono text-2xl font-bold text-foreground tracking-wider">{ticketNumber}</span>
            <button
              onClick={copyToClipboard}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Copy ticket number"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <Link href={`/check-status?ticket=${ticketNumber}`}>
            <Button size="lg" className="w-full gap-2 h-12">
              <Search className="w-4 h-4" />
              Check Ticket Status
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full h-12 bg-white">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
