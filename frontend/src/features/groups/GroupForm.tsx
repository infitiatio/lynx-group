import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import type { GroupFormValues } from '../../shared/types/groups'

interface GroupFormProps {
  initialValues?: GroupFormValues
  submitLabel: string
  onSubmit: (values: GroupFormValues) => Promise<void>
}

interface GroupFieldErrors {
  title?: string
  description?: string
}

function getInitialValues(initialValues?: GroupFormValues): GroupFormValues {
  return {
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
  }
}

function validateGroup(values: GroupFormValues): GroupFieldErrors {
  const errors: GroupFieldErrors = {}

  if (!values.title.trim()) {
    errors.title = 'Title is required.'
  }

  if (!values.description.trim()) {
    errors.description = 'Description is required.'
  }

  return errors
}

export function GroupForm({ initialValues, submitLabel, onSubmit }: GroupFormProps) {
  const initialTitle = initialValues?.title ?? ''
  const initialDescription = initialValues?.description ?? ''
  const [values, setValues] = useState<GroupFormValues>(() => getInitialValues(initialValues))
  const [fieldErrors, setFieldErrors] = useState<GroupFieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setValues({
      title: initialTitle,
      description: initialDescription,
    })
    setFieldErrors({})
    setSubmitError(null)
  }, [initialDescription, initialTitle])

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextTitle = event.target.value
    setValues((currentValues) => ({ ...currentValues, title: nextTitle }))
    if (fieldErrors.title) {
      setFieldErrors((currentErrors) => ({ ...currentErrors, title: undefined }))
    }
  }

  function handleDescriptionChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const nextDescription = event.target.value
    setValues((currentValues) => ({ ...currentValues, description: nextDescription }))
    if (fieldErrors.description) {
      setFieldErrors((currentErrors) => ({ ...currentErrors, description: undefined }))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedValues: GroupFormValues = {
      title: values.title.trim(),
      description: values.description.trim(),
    }

    const validationErrors = validateGroup(trimmedValues)
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onSubmit(trimmedValues)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to save group.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="group-form panel" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label className="field-label" htmlFor="group-title">
          Title
        </label>
        <input
          id="group-title"
          name="title"
          type="text"
          value={values.title}
          onChange={handleTitleChange}
          aria-invalid={fieldErrors.title ? 'true' : 'false'}
          aria-describedby={fieldErrors.title ? 'group-title-error' : undefined}
          maxLength={200}
          autoComplete="off"
        />
        {fieldErrors.title && (
          <p id="group-title-error" className="field-error" role="alert">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="group-description">
          Description
        </label>
        <textarea
          id="group-description"
          name="description"
          value={values.description}
          onChange={handleDescriptionChange}
          aria-invalid={fieldErrors.description ? 'true' : 'false'}
          aria-describedby={fieldErrors.description ? 'group-description-error' : undefined}
          rows={6}
          maxLength={2000}
        />
        {fieldErrors.description && (
          <p id="group-description-error" className="field-error" role="alert">
            {fieldErrors.description}
          </p>
        )}
      </div>

      {submitError && (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      )}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}