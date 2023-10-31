"use client";

import { Button } from "@coaster/components/button/Button";
import { Loading } from "@coaster/components/loading/Loading";
import { useCreatePayoutMethod, useGetStripeDashboardLink, usePayoutMethods } from "@coaster/rpc/client";
import { PayoutMethod, PayoutMethodType } from "@coaster/types";
import { BuildingLibraryIcon, CreditCardIcon } from "@heroicons/react/24/outline";

export default function PayoutMethods() {
  const { payoutMethods } = usePayoutMethods();
  const createPayoutMethod = useCreatePayoutMethod({
    onSuccess: (link) => {
      window.location.href = link;
    },
  });

  const getStripeDashboardLink = useGetStripeDashboardLink({
    onSuccess: (link) => {
      window.open(link, "_blank");
    },
  });

  const edit = useGetStripeDashboardLink({
    onSuccess: (link) => {
      window.open(link, "_blank");
    },
  });

  return (
    <div className="tw-flex tw-flex-col">
      <div className="tw-text-2xl tw-font-bold tw-mb-2">How you'll get paid</div>
      {!payoutMethods ? (
        <Loading />
      ) : (
        <>
          {payoutMethods.length === 0 ? (
            <>
              <div>Add at least one payout method so we know where to send your money.</div>
              <Button
                className="tw-mt-4 tw-w-56 tw-h-10 tw-bg-slate-800 hover:tw-bg-black"
                onClick={createPayoutMethod.mutate}
                disabled={createPayoutMethod.isLoading}
              >
                {createPayoutMethod.isLoading ? <Loading light /> : "Add payout method"}
              </Button>
            </>
          ) : (
            <div className="tw-mt-2">
              {payoutMethods.map((payoutMethod, i) => (
                <div className="tw-flex tw-items-center" key={i}>
                  {getPayoutMethodIcon(payoutMethod.type)}
                  <div className="tw-flex tw-flex-col">
                    <span className="tw-text-base tw-font-medium">{getPayoutMethodTypeDisplay(payoutMethod.type)}</span>
                    {getDetailsForPayoutMethod(payoutMethod)}
                  </div>
                  <Button
                    className="tw-bg-white tw-text-black tw-font-normal tw-border tw-border-solid tw-border-black tw-h-8 tw-w-16 tw-tracking-normal tw-ml-auto hover:tw-bg-slate-200"
                    onClick={edit.mutate}
                    disabled={edit.isLoading}
                  >
                    {edit.isLoading ? <Loading /> : "Edit"}
                  </Button>
                </div>
              ))}
              <Button
                className="tw-mt-8 tw-w-64 tw-h-10 tw-bg-slate-800 hover:tw-bg-black"
                onClick={getStripeDashboardLink.mutate}
                disabled={getStripeDashboardLink.isLoading}
              >
                {getStripeDashboardLink.isLoading ? <Loading light /> : "Access Stripe dashboard"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getPayoutMethodTypeDisplay(type: PayoutMethodType): string {
  switch (type) {
    case PayoutMethodType.BankAccount:
      return "Bank Account";
    case PayoutMethodType.Card:
      return "Card";
  }
}

function getPayoutMethodIcon(type: PayoutMethodType): React.ReactNode {
  switch (type) {
    case PayoutMethodType.BankAccount:
      return <BuildingLibraryIcon className="tw-w-10 tw-h-10 tw-mr-3" />;
    case PayoutMethodType.Card:
      return <CreditCardIcon className="tw-w-10 tw-h-10 tw-mr-3" />;
  }
}

function getDetailsForPayoutMethod(payoutMethod: PayoutMethod): React.ReactNode {
  switch (payoutMethod.type) {
    case PayoutMethodType.BankAccount:
      return (
        <div className="tw-flex tw-gap-1">
          <span>{payoutMethod.bank_account.bank_name},</span>
          {payoutMethod.bank_account.account_type && <span>{payoutMethod.bank_account.account_type}</span>}
          {payoutMethod.bank_account.last4 && <span>•••••{payoutMethod.bank_account.last4}</span>}
          {payoutMethod.bank_account.currency && <span> ({payoutMethod.bank_account.currency.toUpperCase()})</span>}
        </div>
      );
    case PayoutMethodType.Card:
      return (
        <div className="tw-flex tw-gap-2">
          <span>{payoutMethod.card.brand},</span>
          {payoutMethod.card.last4 && <span>•••••{payoutMethod.card.last4}</span>}
          {payoutMethod.card.currency && <span>({payoutMethod.card.currency.toUpperCase()})</span>}
        </div>
      );
  }
}
