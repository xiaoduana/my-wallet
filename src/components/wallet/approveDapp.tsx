import { useEffect, useState } from "react";
import { ethers } from "ethers";
import React from "react";
import { StorageService } from "@/services/storage.service"

export default function ApprovalPage() {
  const [approval, setApproval] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 获取 approvalId
   */
  const params = new URLSearchParams(
    window.location.search
  );

  const approvalId = params.get("id");

  /**
   * 获取交易信息
   */
  useEffect(() => {
    async function loadApproval() {
      const key = `approval_${approvalId}`;
      const data =await StorageService.get(key)

      setApproval(data);

      setLoading(false);
    }

    loadApproval();
  }, []);

  /**
   * 确认交易
   */
  async function handleApprove() {
    console.log("handleApprove---approvalId:", approvalId);
    console.log("handleApprove---approval:", approval);
    try {
      await chrome.runtime.sendMessage({
        type: "APPROVE_TX",
        approvalId
      });

      window.close();
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * 拒绝交易
   */
  async function handleReject() {
    console.log("handleReject---approvalId:", approvalId);
    console.log("handleReject---approval:", approval);
    try {
      // await chrome.runtime.sendMessage({
      //   type: "REJECT_TX",
      //   approvalId
      // });

      window.close();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm">
        Loading...
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="flex h-screen items-center justify-center text-sm">
        No approval found
      </div>
    );
  }

  const tx = approval.tx;

  /**
   * value
   */
  const value = tx.value
    ? ethers.formatEther(tx.value)
    : "0";

  /**
   * ERC20 approve decode
   */
  let decodedApprove = null;

  try {
    if (
      tx.data &&
      tx.data.startsWith("0x095ea7b3")
    ) {
      const iface = new ethers.Interface([
        "function approve(address spender,uint256 amount)"
      ]);

      const decoded =
        iface.parseTransaction({
          data: tx.data
        });

      decodedApprove = {
        spender: decoded?.args[0],
        amount: decoded?.args[1]?.toString()
      };
    }
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="min-h-screen bg-white p-4">
      {/* header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold">
          Transaction Approval
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review transaction before signing
        </p>
      </div>

      {/* card */}
      <div className="rounded-2xl border border-gray-200 p-4 shadow-sm">
        {/* type */}
        <div className="mb-4">
          <div className="text-xs text-gray-400">
            Type
          </div>

          <div className="mt-1 text-sm font-medium">
            {decodedApprove
              ? "ERC20 Approve"
              : "Contract Interaction"}
          </div>
        </div>

        {/* from */}
        <div className="mb-4">
          <div className="text-xs text-gray-400">
            From
          </div>

          <div className="mt-1 break-all text-sm">
            {tx.from}
          </div>
        </div>

        {/* to */}
        <div className="mb-4">
          <div className="text-xs text-gray-400">
            To
          </div>

          <div className="mt-1 break-all text-sm">
            {tx.to}
          </div>
        </div>

        {/* value */}
        <div className="mb-4">
          <div className="text-xs text-gray-400">
            Value
          </div>

          <div className="mt-1 text-sm">
            {value} ETH
          </div>
        </div>

        {/* approve */}
        {decodedApprove && (
          <>
            <div className="mb-4">
              <div className="text-xs text-gray-400">
                Spender
              </div>

              <div className="mt-1 break-all text-sm">
                {
                  decodedApprove.spender
                }
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-400">
                Amount
              </div>

              <div className="mt-1 break-all text-sm">
                {
                  decodedApprove.amount
                }
              </div>
            </div>
          </>
        )}

        {/* gas */}
        <div className="mb-4">
          <div className="text-xs text-gray-400">
            Gas Limit
          </div>

          <div className="mt-1 text-sm">
            {tx.gas || tx.gasLimit || "-"}
          </div>
        </div>

        {/* data */}
        <div>
          <div className="text-xs text-gray-400">
            Data
          </div>

          <div className="mt-1 max-h-32 overflow-auto break-all rounded-lg bg-gray-100 p-2 text-xs">
            {tx.data || "0x"}
          </div>
        </div>
      </div>

      {/* buttons */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={handleReject}
          className="rounded-xl border border-gray-300 py-3 text-sm font-medium"
        >
          Reject
        </button>

        <button
          onClick={handleApprove}
          className="rounded-xl bg-black py-3 text-sm font-medium text-white"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}