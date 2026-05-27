import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useWalletStore } from '@/store/wallet';
import {
  Check,
  Coins,
  Copy,
  Eye,
  EyeOff,
  LogOut,
  Network,
  Plus,
  Send,
  Wallet,
  ChevronDown
} from 'lucide-react';
import React, { useState } from 'react';
import { AccountManager } from './AccountManager';
import { NetworkSelector } from './NetworkSelector';
import { SendTransaction } from './SendTransaction';
import { TokenManager } from './TokenManager';

export const WalletDashboard = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'networks' | 'tokens' | 'send'>('overview');

  const { currentAccount, currentNetwork, lockWallet, tokens } = useWalletStore();
  console.log(currentAccount);
  console.log(currentNetwork);


  const { ethBalance, isLoading, refreshBalances } = useWalletBalance();
  const { toast } = useToast();

  const copyAddress = async () => {
    if (currentAccount?.address) {
      await navigator.clipboard.writeText(currentAccount.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
      toast({
        title: "地址已复制",
        description: "钱包地址已复制到剪贴板"
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!currentAccount) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div>
              <p onClick={() => setActiveTab('accounts')} className="flex items-center text-lg text-black text-bold text-muted-foreground cursor-pointer">
                {currentAccount.name}<ChevronDown className='inline-block' />
              </p>
            </div>
            <div className="flex mt-2">
              {formatAddress(currentAccount.address)}<Copy onClick={copyAddress} className="inline-block ml-2 w-4 h-4" />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={lockWallet}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex gap-1 justify-between rounded-md bg-[rgb(200,201,199)] overflow-x-hidden">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            总览
          </Button>
          <Button
            variant={activeTab === 'networks' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('networks')}
          >
            <Network className="w-4 h-4 mr-1" />
            网络
          </Button>
          <Button
            variant={activeTab === 'tokens' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('tokens')}
          >
            <Coins className="w-4 h-4 mr-1" />
            代币
          </Button>
          <Button
            variant={activeTab === 'send' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('send')}
          >
            <Send className="w-4 h-4 mr-1" />
            转账
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Balance Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  钱包余额
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                  >
                    {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshBalances}
                    disabled={isLoading}
                  >
                    刷新
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {showBalance ? `${parseFloat(ethBalance).toFixed(4)} ${currentNetwork.symbol}` : '••••••'}
                  </div>
                  {isLoading && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tokens */}
            {tokens.length > 0 && (
              <Card className="border border-border/50 shadow-sm rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    代币资产
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                  {tokens.map((token) => (
                    <div
                      key={token.address}
                      className="
                        flex items-center justify-between
                        p-1 rounded-xl
                        hover:bg-muted/50
                        transition-colors
                        cursor-pointer
                      "
                    >
                      {/* 左侧 */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* token logo */}
                        <div className="shrink-0">
                          {token.image ? (
                            <img
                              src={token.image}
                              alt={token.symbol}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                              {token.symbol?.slice(0, 1)}
                            </div>
                          )}
                        </div>

                        {/* token info */}
                        <div className="min-w-0">
                          <div className="font-semibold truncate">
                            {token.symbol}
                          </div>

                          <div className="text-sm text-muted-foreground truncate">
                            {token.name}
                          </div>
                        </div>
                      </div>

                      {/* 右侧 */}
                      <div className="text-right">
                        <div className="font-semibold text-base">
                          {showBalance ? (token.balance || '0') : '••••'}
                        </div>

                        <div className="text-xs text-muted-foreground uppercase">
                          {token.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          </div>
        )}

        {activeTab === 'accounts' && <AccountManager />}
        {activeTab === 'networks' && <NetworkSelector />}
        {activeTab === 'tokens' && <TokenManager />}
        {activeTab === 'send' && <SendTransaction />}
      </div>
    </div>
  );
};