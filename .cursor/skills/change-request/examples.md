# Change request examples

## Example 1: clear request, no questions

**Person:** "В списъка с имоти в админа искам да виждам и брокера на всеки имот."

**product-analyst says:** admin, `/properties`; the list already loads `agentName` for each property but does not show it; no API change; no risk.

**Assistant (good):**

> Разбирам, че искате в списъка с имоти в админа да има колона с отговорния брокер.
>
> Какво ще се промени: нова колона "Брокер" в списъка с имоти.
> Къде ще го видите: Админ -> Имоти.
> Приемам, че: ако имот няма брокер, ще пише "—".
> Не влиза сега: филтър по брокер.
>
> Да започна ли?

No questions were needed: the code answered where and what, the only open case became an assumption.

## Example 2: real ambiguity, one short round

**Person:** "Искам клиентите да могат да си запазват любими имоти."

**product-analyst says:** public site; no favourites today; needs a decision: favourites with or without a visitor account (login on the public site does not exist).

**Assistant (good):** one round, two questions:

1. "Къде да се пазят любимите?" -> `Само в този браузър, без регистрация (препоръчително)` / `В профил с вход` / `Друго`
2. "Трябва ли брокерите да виждат кои имоти са запазвани?" -> `Не, само броят (препоръчително)` / `Да, по клиент` / `Друго`

If the person picks "В профил с вход": stop and flag for the developer (new login for visitors = architecture + security decision).

## Bad: too many and technical questions

> Искате ли данните да са в базата или в localStorage? Да направя ли нов endpoint? Колко записа максимум? Какъв цвят да е иконата? Да има ли анимация? На мобилно също ли? Искате ли тестове?

Wrong because: technical terms, questions the code or defaults answer (mobile is always supported, tests are always written), details that can be assumptions (icon colour follows the site style), and far more than 3 questions.
