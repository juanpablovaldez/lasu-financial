import { useEffect, useRef } from 'react';
import type { TextInput } from 'react-native';

/**
 * Type for a map of field names to their refs
 */
export type FieldRefsMap = Record<string, React.RefObject<TextInput>>;

/**
 * Hook to automatically focus the first field with an error after form submission.
 *
 * This improves accessibility by moving keyboard focus to the problematic field,
 * helping users quickly identify and fix validation errors.
 *
 * @param errors - Object containing field errors (key = field name, value = error message)
 * @param fieldRefs - Map of field names to their TextInput refs
 * @param deps - Optional dependencies array to control when focus should trigger
 *
 * @example
 * ```tsx
 * function SignInForm() {
 *   const emailRef = useRef<TextInput>(null);
 *   const passwordRef = useRef<TextInput>(null);
 *
 *   const fieldRefs = {
 *     email: emailRef,
 *     password: passwordRef,
 *   };
 *
 *   const form = useForm({
 *     // ... form config
 *   });
 *
 *   // Get errors from form state
 *   const errors = {
 *     email: form.getFieldMeta('email').errors?.[0],
 *     password: form.getFieldMeta('password').errors?.[0],
 *   };
 *
 *   // Automatically focus first error field
 *   useFormFocusManagement(errors, fieldRefs);
 *
 *   return (
 *     <View>
 *       <TextInput ref={emailRef} ... />
 *       <TextInput ref={passwordRef} ... />
 *     </View>
 *   );
 * }
 * ```
 */
export function useFormFocusManagement(
  errors: Record<string, string | undefined | null>,
  fieldRefs: FieldRefsMap,
  deps: React.DependencyList = [],
): void {
  const hasTriedFocus = useRef(false);

  useEffect(() => {
    // Find first field with error
    const firstErrorField = Object.keys(errors).find((fieldName) => errors[fieldName]);

    if (firstErrorField && fieldRefs[firstErrorField]?.current && !hasTriedFocus.current) {
      // Small delay to ensure the error message is rendered
      const timeoutId = setTimeout(() => {
        fieldRefs[firstErrorField]?.current?.focus();
        hasTriedFocus.current = true;
      }, 100);

      return () => clearTimeout(timeoutId);
    }

    // Reset focus tracking when all errors are cleared
    if (!firstErrorField) {
      hasTriedFocus.current = false;
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors, fieldRefs, ...deps]);
}

/**
 * Helper to create field refs map from field names.
 *
 * @example
 * ```tsx
 * const fieldRefs = useFieldRefs(['email', 'password', 'confirmPassword']);
 * // Returns: { email: RefObject, password: RefObject, confirmPassword: RefObject }
 * ```
 */
export function useFieldRefs<T extends string>(
  fieldNames: readonly T[],
): Record<T, React.RefObject<TextInput>> {
  const refs = useRef<Record<string, React.RefObject<TextInput>>>({});

  // Initialize refs for each field
  fieldNames.forEach((name) => {
    if (!refs.current[name]) {
      refs.current[name] = { current: null };
    }
  });

  return refs.current as Record<T, React.RefObject<TextInput>>;
}
