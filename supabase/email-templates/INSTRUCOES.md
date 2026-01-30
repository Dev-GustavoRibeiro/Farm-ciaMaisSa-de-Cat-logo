# 📧 Templates de E-mail - Farmácia Mais Saúde

Este diretório contém os templates de e-mail personalizados para o sistema de autenticação.

## 🎨 Templates Disponíveis

| Arquivo | Uso no Supabase | Descrição |
|---------|-----------------|-----------|
| `confirm-email.html` | Confirm signup | Enviado quando um novo usuário se cadastra |
| `reset-password.html` | Reset password | Enviado quando o usuário solicita recuperação de senha |
| `magic-link.html` | Magic Link | Enviado quando o usuário solicita login por link |
| `change-email.html` | Change Email Address | Enviado quando o usuário altera seu e-mail |

## ⚙️ Como Configurar no Supabase

### Passo 1: Acessar o Painel
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Authentication** > **Email Templates**

### Passo 2: Configurar cada Template

Para cada template:

1. Clique no tipo de e-mail (ex: "Confirm signup")
2. Cole o HTML do arquivo correspondente
3. Configure o **Subject** (assunto):

| Template | Subject Recomendado |
|----------|---------------------|
| Confirm signup | `Confirme seu e-mail - Farmácia Mais Saúde` |
| Reset password | `Recupere sua senha - Farmácia Mais Saúde` |
| Magic Link | `Seu link de acesso - Farmácia Mais Saúde` |
| Change Email | `Confirme seu novo e-mail - Farmácia Mais Saúde` |

4. Clique em **Save**

### Passo 3: Configurar o Remetente

1. Vá em **Project Settings** > **Auth**
2. Role até **SMTP Settings**
3. Configure seu provedor de e-mail (ou use o padrão do Supabase)

**Recomendação:** Configure um SMTP próprio para melhor entrega.

Opções populares:
- **Resend** (grátis até 3.000 emails/mês)
- **SendGrid** (grátis até 100 emails/dia)
- **Amazon SES** (muito barato em produção)

## 🔧 Variáveis Disponíveis

Os templates usam variáveis do Supabase:

| Variável | Descrição |
|----------|-----------|
| `{{ .ConfirmationURL }}` | Link de confirmação/ação |
| `{{ .Email }}` | E-mail do usuário |
| `{{ .Token }}` | Token de confirmação |
| `{{ .TokenHash }}` | Hash do token |
| `{{ .SiteURL }}` | URL do site |

## 💡 Dicas

1. **Teste antes de produção**: Use um e-mail de teste para verificar se os templates estão corretos

2. **Verifique o spam**: Certifique-se que os e-mails não estão caindo no spam

3. **Mobile-first**: Os templates já são responsivos, mas teste em dispositivos móveis

4. **Personalização**: Você pode editar cores, textos e adicionar seu logo

## 🎯 Cores da Marca

As cores usadas nos templates seguem a identidade visual:

- **Azul Escuro (Principal):** `#1e3a5f`
- **Azul Marinho:** `#0f172a`
- **Vermelho:** `#ef4444` / `#dc2626`
- **Verde:** `#16a34a`
- **Fundo:** `#f3f4f6`

---

Desenvolvido para Farmácia Mais Saúde - Ipirá, BA
