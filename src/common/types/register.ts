export interface RegisterFormData {
    username?: string,
    email?: string,
    password?: string;
    passwordConfirm?: string;
    regAdminMails?: boolean;
    regAgreedTerms?: boolean;
}

export type FormErrors = Partial<Record<keyof RegisterFormData | 'global', string>>;