import React from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function TestPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-white text-2xl mb-4">Component Test</h1>

        <Input
          label="Test Input"
          type="text"
          placeholder="Type something..."
        />

        <Button variant="gold">
          Test Button
        </Button>
      </div>
    </div>
  );
}
