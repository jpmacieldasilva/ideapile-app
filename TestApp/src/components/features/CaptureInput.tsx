import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CaptureInputProps } from '../../types';
import { extractHashtags, sanitizeText } from '../../utils';
import { cn } from '../../utils/cn';

export function CaptureInput({
  onSave,
  onCancel,
  placeholder = 'Digite sua ideia aqui...',
  initialValue = '',
}: CaptureInputProps) {
  const [content, setContent] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  // Auto-extrair hashtags do conteúdo
  const extractedTags = extractHashtags(content);

  const handleSave = async () => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      Alert.alert('Atenção', 'Por favor, digite alguma coisa antes de salvar.');
      textInputRef.current?.focus();
      return;
    }

    try {
      setIsLoading(true);
      
      // Limpar e extrair tags
      const cleanContent = sanitizeText(trimmedContent);
      const tags = extractHashtags(cleanContent);
      
      await onSave(cleanContent, tags);
      
      // Limpar input após salvar
      setContent('');
    } catch (error) {
      console.error('Erro ao salvar ideia:', error);
      Alert.alert('Erro', 'Não foi possível salvar a ideia. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (content.trim() && content.trim() !== initialValue) {
      Alert.alert(
        'Descartar alterações?',
        'Você tem conteúdo não salvo. Deseja realmente cancelar?',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { 
            text: 'Descartar', 
            style: 'destructive',
            onPress: () => {
              setContent('');
              onCancel();
            }
          },
        ]
      );
    } else {
      setContent('');
      onCancel();
    }
  };

  const characterCount = content.length;
  const isNearLimit = characterCount > 450;
  const isOverLimit = characterCount > 500;

  return (
    <Card variant="outlined" padding="md" className="mx-4 mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-foreground">
          Nova Ideia
        </Text>
        <TouchableOpacity
          onPress={handleCancel}
          className="p-1"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text className="text-lg text-muted-foreground">✕</Text>
        </TouchableOpacity>
      </View>

      {/* Text Input */}
      <TextInput
        ref={textInputRef}
        value={content}
        onChangeText={setContent}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        multiline
        autoFocus
        className={cn(
          'bg-input border border-border rounded-lg p-3 mb-4',
          'text-base text-foreground leading-5',
          'min-h-[120px] max-h-[200px]',
          isOverLimit && 'border-red-500'
        )}
        style={{ textAlignVertical: 'top' }}
      />

      {/* Character count */}
      <View className="flex-row justify-between items-center mb-4">
        <Text
          className={cn(
            'text-xs',
            isOverLimit ? 'text-red-500' : 
            isNearLimit ? 'text-yellow-600' : 'text-muted-foreground'
          )}
        >
          {characterCount}/500 caracteres
        </Text>

        {/* Tags preview */}
        {extractedTags.length > 0 && (
          <View className="flex-row items-center">
            <Text className="text-xs text-muted-foreground mr-2">
              Tags:
            </Text>
            <View className="flex-row">
              {extractedTags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  className="bg-blue-100 px-2 py-1 rounded mr-1"
                >
                  <Text className="text-xs text-blue-700">
                    #{tag}
                  </Text>
                </View>
              ))}
              {extractedTags.length > 3 && (
                <Text className="text-xs text-blue-600">
                  +{extractedTags.length - 3}
                </Text>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Actions */}
      <View className="flex-row space-x-3">
        <Button
          variant="outline"
          onPress={handleCancel}
          className="flex-1"
          disabled={isLoading}
        >
          Cancelar
        </Button>
        
        <Button
          onPress={handleSave}
          className="flex-1"
          loading={isLoading}
          disabled={!content.trim() || isOverLimit}
        >
          Salvar
        </Button>
      </View>
    </Card>
  );
}

export default CaptureInput;
