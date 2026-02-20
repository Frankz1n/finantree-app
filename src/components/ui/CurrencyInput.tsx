import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value: string | number
    onChange: (value: string) => void
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ value, onChange, className, ...props }, ref) => {
        const [displayValue, setDisplayValue] = useState("")

        useEffect(() => {
            const numericValue = typeof value === "string" ? parseFloat(value) : value
            if (!isNaN(numericValue)) {
                setDisplayValue(formatMoney(numericValue))
            } else {
                setDisplayValue("")
            }
        }, [value])

        const formatMoney = (value: number) => {
            return value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
            })
        }

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value


            const onlyDigits = inputValue.replace(/\D/g, "")

            if (onlyDigits === "") {
                onChange("")
                return
            }

            const numericValue = parseFloat(onlyDigits) / 100
            onChange(numericValue.toString())
        }

        return (
            <Input
                {...props}
                ref={ref}
                value={displayValue}
                onChange={handleChange}
                className={className}
                placeholder="R$ 0,00"
            />
        )
    }
)

CurrencyInput.displayName = "CurrencyInput"
