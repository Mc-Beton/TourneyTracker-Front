import { ArmyListStatus } from "@/lib/types/participant";
import { FileText, DollarSign } from "lucide-react";

interface PaymentStatusBadgeProps {
  isPaid: boolean;
}

export function PaymentStatusBadge({ isPaid }: PaymentStatusBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md ${
        isPaid
          ? "bg-green-100 text-green-700 border border-green-300"
          : "bg-gray-100 text-gray-500 border border-gray-300"
      }`}
    >
      <DollarSign className="w-4 h-4" />
    </div>
  );
}

interface ArmyListStatusBadgeProps {
  status: ArmyListStatus;
}

export function ArmyListStatusBadge({ status }: ArmyListStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case ArmyListStatus.NOT_SUBMITTED:
        return {
          color: "bg-gray-100 text-gray-500 border-gray-300",
          label: "Brak rozpiski",
        };
      case ArmyListStatus.PENDING:
        return {
          color: "bg-yellow-100 text-yellow-700 border-yellow-300",
          label: "Oczekuje",
        };
      case ArmyListStatus.APPROVED:
        return {
          color: "bg-green-100 text-green-700 border-green-300",
          label: "Zatwierdzona",
        };
      case ArmyListStatus.REJECTED:
        return {
          color: "bg-red-100 text-red-700 border-red-300",
          label: "Odrzucona",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-500 border-gray-300",
          label: "Nieznany",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border ${config.color}`}
    >
      <FileText className="w-4 h-4" />
    </div>
  );
}
