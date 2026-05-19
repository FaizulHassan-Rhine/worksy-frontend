'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Label from '@/components/ui/Label';
import Select from '@/components/ui/Select';
import { APP_NAME } from '@/constants/branding';
import { getInviteRolesForActor } from '@/constants/team';

const buildSchema = (roles) =>
  z.object({
    email: z.string().trim().email('Please provide a valid email'),
    role: z.enum(roles.length ? roles : ['member']),
  });

export default function InviteMemberModal({ open, onClose, actorRole, onInvited }) {
  const [formError, setFormError] = useState('');
  const inviteRoles = getInviteRolesForActor(actorRole);
  const roleValues = inviteRoles.map((r) => r.value);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(buildSchema(roleValues)),
    defaultValues: { email: '', role: 'member' },
  });

  const onSubmit = async (values) => {
    setFormError('');
    try {
      await onInvited({ email: values.email, role: values.role });
      reset();
      onClose();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to invite member');
    }
  };

  const handleClose = () => {
    reset();
    setFormError('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Invite team member"
      description={`User must already have a ${APP_NAME} account.`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {formError}
          </div>
        )}

        <div>
          <Label htmlFor="invite-email">Email address</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="colleague@company.com"
            error={errors.email}
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="invite-role">Role</Label>
          <Select
            id="invite-role"
            className="mt-1"
            value={watch('role')}
            options={inviteRoles.map((r) => ({ value: r.value, label: r.label }))}
            {...register('role')}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" loading={isSubmitting}>
            Send invite
          </Button>
        </div>
      </form>
    </Modal>
  );
}
