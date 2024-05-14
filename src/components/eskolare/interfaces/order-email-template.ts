export default interface orderEmailTemplate {
    number: string,
    name: string,
    local: string,
    activitiesPerWeek: number,
    school: {
        name: string,
        fullAddress: string,
        class: string
    },
    payment: {
        installments: number,
        installments_amount: number
    }
}