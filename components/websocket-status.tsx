"use client";
import React from 'react';
import { useWebSocket } from '@/contexts/websocket-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';

export function WebSocketStatus() {
  const { isConnected, connectionStatus, reconnect } = useWebSocket();

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "Connected":
        return <Wifi className="h-3 w-3" />;
      case "Connecting":
        return <RefreshCw className="h-3 w-3 animate-spin" />;
      case "Error":
      case "Failed":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <WifiOff className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "Connected":
        return "bg-green-100 text-green-800 border-green-200";
      case "Connecting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Error":
      case "Failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="outline" 
        className={`flex items-center gap-1 ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span className="text-xs">
          {connectionStatus === "Connected" ? "Live" : connectionStatus}
        </span>
      </Badge>
      
      {!isConnected && connectionStatus !== "Connecting" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={reconnect}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reconnect
        </Button>
      )}
    </div>
  );
}
