# Инициализация

Чтобы начать работу с модулем, Вам необходимо импортировать и инициализировать его:

```typescript
import { Telegraf } from 'telegraf'
import { Sender, setupSender } from 'telegraf-sender-ts'
import { TelegrafContext } from 'telegraf/typings/context'
type Context = TelegrafContext & Sender

const bot: Telegraf<Context> = new Telegraf(token)
bot.use(setupSender)
```

# Отправка сообщений

### Текущему пользователю

```
ctx.msg?.send(text: string, extra: ExtraSendMessage)
```

### Пользователю с другим id

```
ctx.msg?.sendTo(userId: number, text: string, extra: ExtraSendMessage)
```

# Всплывающие уведомления

### Alert

```typescript
ctx.msg?.alert('Пример модального окна')
```

### Toast

```typescript
ctx.msg?.toast('Всплывающее уведомление')
```

# Изменение сообщений

Для этого воспользуйтесь методом edit:

```
ctx.msg?.edit(text: string, extra: ExtraEditMessage)
```

# Удаление сообщений

Для этого воспользуйтесь методом del:

```typescript
ctx.msg?.del()
```

# Рассылка сообщений

Для рассылки сообщений Вам нужно подготовить массив с айди пользователей, которым нужно сделать рассылку:

```typescript
const users: number[] = [id1, id2, id3]
```

Далее сделать саму рассылку:

```typescript
ctx.msg?.broadcast(users)
```

Вам не нужно передавать текст или extra в метод, т.к. эти данные соберёт сам метод из **ctx.message**. Также Вы можете передать в этот метод callback и узнать когда рассылка будет завершена:

```typescript
const callback: Function = (): void => console.log('Рассылка завершена!')
ctx.msg?.broadcast(users, callback)
```

И ещё Вы можете выполнять какие-то действия для каждого пользователя, которому будет отправлена рассылка:

```typescript
const callback: Function = (): void => console.log('Рассылка завершена!')
const action: (userId: number) => any = (userId: number) => console.log(`Отправка пользователю ${userId}`)
ctx.msg?.broadcast(users, callback, action)
```

# Информация

Рассылка сообщений с форматом **30 сообщений в секунду**. Модуль разработан для библиотеки Telegraf версии 3.39 на TypeScript. Больше примеров Вы можете найти в файле **test.js**