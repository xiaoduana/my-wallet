
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import React from "react";

export interface Token {
  address: string;
  symbol: string;
  type: string;
  image?: string;
}

interface TokenSelectProps {
  tokens: Token[];

  value?: string;

  onChange?: (token: Token) => void;

  storageKey?: string;

  placeholder?: string;
}

export default function TokenSelect({
  tokens,
  value,
  onChange,
  storageKey = "selected-token",
  placeholder = "选择代币",
}: TokenSelectProps) {
  const [open, setOpen] = useState(false);

  const [selected, setSelected] = useState<Token | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  // 初始化缓存
  useEffect(() => {
    const cache = localStorage.getItem(storageKey);

    if (cache) {
      const token = JSON.parse(cache);

      setSelected(token);
    }
  }, [storageKey]);

  // 外部 value 控制
  useEffect(() => {
    if (!value) return;

    const token = tokens.find((t) => t.address === value);

    if (token) {
      setSelected(token);
    }
  }, [value, tokens]);

  // 点击外部关闭
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  const handleSelect = (token: Token) => {
    setSelected(token);

    localStorage.setItem(storageKey, JSON.stringify(token));

    onChange?.(token);

    setOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      {/* trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          flex
          h-10
          w-full
          items-center
          justify-between
          rounded-lg
          border
          border-zinc-700
          px-3
          text-sm
        "
      >
        <div className="flex items-center gap-2">
          {selected?.image && (
            <img
              src={selected.image}
              alt={selected.symbol}
              className="h-5 w-5 rounded-full"
            />
          )}

          <span>
            {selected
              ? `${selected.symbol} (${selected.type})`
              : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* dropdown */}
      {open && (
        <div
          className="
            absolute
            left-0
            top-12
            z-[9999]
            max-h-60
            w-full
            overflow-auto
            rounded-lg
            border
            border-zinc-700
            bg-white
            shadow-xl
          "
        >
          {tokens.map((token) => {
            const active =
              selected?.address === token.address;

            return (
              <button
                key={token.address}
                type="button"
                onClick={() => handleSelect(token)}
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  px-3
                  py-2
                  text-left
                  text-sm
                  hover:bg-gray-100
                "
              >
                <div className="flex items-center gap-2">
                  {token.image && (
                    <img
                      src={token.image}
                      alt={token.symbol}
                      className="h-5 w-5 rounded-full"
                    />
                  )}

                  <span>
                    {token.symbol} ({token.type})
                  </span>
                </div>

                {active && (
                  <Check className="h-4 w-4" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}