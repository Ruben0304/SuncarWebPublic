'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useClient } from '@/hooks/useClient';
import { clientVerificationService } from '@/services';

interface ClientVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ClientVerificationDialog({ 
  open, 
  onOpenChange 
}: ClientVerificationDialogProps) {
  const { setClientData } = useClient();
  const [step, setStep] = useState<'welcome' | 'input' | 'success' | 'error'>('welcome');
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset dialog state when it opens
  useEffect(() => {
    if (open) {
      setStep('welcome');
      setIdentifier('');
      setIsLoading(false);
      setErrorMessage('');
    }
  }, [open]);

  const handleIsClientResponse = (isClient: boolean) => {
    if (isClient) {
      setStep('input');
    } else {
      onOpenChange(false);
    }
  };

  const handleVerifyClient = async () => {
    if (!identifier.trim()) {
      setErrorMessage('Por favor ingresa tu número de cliente o teléfono');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await clientVerificationService.verificarCliente(identifier.trim());
      
      if (response.success && response.data) {
        setClientData(response.data);
        setStep('success');
        // Cerrar el diálogo después de mostrar el éxito por 2 segundos
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      } else {
        setErrorMessage(response.message || 'Cliente no encontrado');
        setStep('error');
      }
    } catch (error) {
      setErrorMessage('Error al verificar el cliente. Inténtalo de nuevo.');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setStep('input');
    setIdentifier('');
    setErrorMessage('');
  };

  const getDialogContent = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#F26729] to-[#FDB813] rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                ¡Bienvenido a Suncar!
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Para brindarte la mejor experiencia personalizada, ¿eres cliente nuestro?
              </DialogDescription>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => handleIsClientResponse(true)}
                className="bg-gradient-to-r from-[#F26729] to-[#FDB813] hover:from-[#e55a1f] hover:to-[#e6a610] text-white font-medium py-3"
                size="lg"
              >
                <User className="w-4 h-4 mr-2" />
                Sí, soy cliente
              </Button>
              
              <Button 
                onClick={() => handleIsClientResponse(false)}
                variant="outline"
                className="border-2 hover:bg-gray-50 py-3"
                size="lg"
              >
                No, soy un visitante
              </Button>
            </div>
          </div>
        );

      case 'input':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#F26729] to-[#FDB813] rounded-full flex items-center justify-center mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                Verificación de Cliente
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Ingresa tu número de cliente o número de teléfono
              </DialogDescription>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                  Número de Cliente o Teléfono
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="ej. CLIENTE001 o 555-1234"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="text-center font-mono"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleVerifyClient();
                    }
                  }}
                />
              </div>

              {errorMessage && (
                <div className="text-center text-sm text-red-600 bg-red-50 py-2 px-3 rounded-md">
                  {errorMessage}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('welcome')}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleVerifyClient}
                  disabled={isLoading || !identifier.trim()}
                  className="flex-1 bg-gradient-to-r from-[#F26729] to-[#FDB813] hover:from-[#e55a1f] hover:to-[#e6a610] text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar'
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                ¡Cliente Verificado!
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Bienvenido de vuelta. Ahora tienes acceso a ofertas exclusivas.
              </DialogDescription>
            </div>

            <Card className="bg-gradient-to-br from-[#F26729]/10 to-[#FDB813]/10 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Cliente Verificado</p>
                    <p className="text-sm text-gray-600">Acceso a ofertas especiales</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-[#F26729] to-[#FDB813] text-white">
                    VIP
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'error':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                Cliente No Encontrado
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {errorMessage || 'No pudimos encontrar tu información. Verifica los datos e inténtalo nuevamente.'}
              </DialogDescription>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleTryAgain}
                variant="outline"
                className="flex-1"
              >
                Intentar Nuevamente
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1 bg-gradient-to-r from-[#F26729] to-[#FDB813] hover:from-[#e55a1f] hover:to-[#e6a610] text-white"
              >
                Continuar sin verificar
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>Verificación de Cliente</DialogTitle>
          <DialogDescription>
            Proceso de verificación de cliente para Suncar
          </DialogDescription>
        </DialogHeader>
        {getDialogContent()}
      </DialogContent>
    </Dialog>
  );
}
