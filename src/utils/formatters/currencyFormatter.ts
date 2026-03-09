export const formatCurrency = (amount: number, currency = 'ZAR', locale = 'en-ZA') => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    }).format(amount)
}

export const formatNumber = (num: number, locale = 'en-ZA') => {
    return new Intl.NumberFormat(locale).format(num)
}
