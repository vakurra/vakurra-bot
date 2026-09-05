# Frontend structure

```text
app/                 запуск приложения и глобальные providers
pages/               страницы и композиция экранов
features/            пользовательские сценарии
entities/            сущности домена, например bot или category
shared/api/           HTTP-клиент и типы API
shared/ui/            переиспользуемые UI-компоненты
shared/lib/           небольшие утилиты
```

Компоненты не обращаются к backend напрямую через `fetch`; запросы должны идти
через `shared/api`.
