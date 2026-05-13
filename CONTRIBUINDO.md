# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para este projeto! Siga as instruções abaixo.

## 📋 Como Contribuir

### 1. Fork o Repositório
Clique no botão "Fork" no GitHub para criar a sua cópia.

### 2. Clonar o seu Fork
```bash
git clone https://github.com/seu-username/ipca-gestao-academica-node.git
cd ipca-gestao-academica-node
```

### 3. Criar uma Branch
```bash
git checkout -b feature/sua-feature
# ou
git checkout -b fix/seu-bug
```

### 4. Fazer Alterações
- Editar os ficheiros necessários
- Testar localmente
- Seguir o style guide (ver abaixo)

### 5. Commit e Push
```bash
git add .
git commit -m "Descrição clara da alteração"
git push origin feature/sua-feature
```

### 6. Criar Pull Request
- Ir para o repositório original
- Clique em "New Pull Request"
- Descreva a sua contribuição

---

## 📝 Regras de Código

### JavaScript
- Usar `const` por padrão, `let` se necessário
- Evitar `var`
- Usar arrow functions quando apropriado
- Adicionar comentários para código complexo

```javascript
// ✅ Bom
const calcularMedia = (notas) => {
  return notas.reduce((a, b) => a + b, 0) / notas.length;
};

// ❌ Evitar
var calcularMedia = function(notas) {
  // ...
};
```

### HTML
- Usar HTML5 semântico
- Acessibilidade é importante (alt text, labels)
- Indentação com 2 espaços

```html
<!-- ✅ Bom -->
<button type="button" aria-label="Abrir menu" onclick="abrirMenu()">
  Menu
</button>

<!-- ❌ Evitar -->
<div onclick="abrirMenu()">Menu</div>
```

### CSS
- Usar classes ao invés de IDs
- Mobile-first design
- Reutilizar variáveis

```css
/* ✅ Bom */
.card {
  background: var(--primary-color);
  padding: 1rem;
}

/* ❌ Evitar */
#myCard {
  background: #003366;
  padding: 16px;
}
```

---

## 🐛 Reportar Bugs

Abra uma Issue com:
- **Título**: Breve descrição do bug
- **Descrição**: Como reproduzir o problema
- **Comportamento esperado**: O que deveria acontecer
- **Screenshots**: Se aplicável
- **Ambiente**: Browser, Node.js version, OS

---

## 💡 Sugerir Features

Abra uma Issue com:
- **Título**: Título descritivo
- **Descrição**: Detalhes da feature
- **Benefício**: Por que seria útil
- **Exemplos**: Se possível, exemplos de uso

---

## ✅ Checklist Antes de Submeter PR

- [ ] Código segue o style guide
- [ ] Comentários adicionados (se necessário)
- [ ] Testes executados localmente
- [ ] Sem `console.log` desnecessário
- [ ] README atualizado (se necessário)
- [ ] Commit message clara e descritiva

---

## 🎯 Áreas Prioritárias

Estas contribuições seriam muito bem-vindas:

1. **Testes** - Adicionar testes unitários com Jest
2. **Documentação** - Melhorar documentação de APIs
3. **Performance** - Otimizar queries
4. **UI/UX** - Melhorar design responsivo
5. **Segurança** - Auditorias de segurança

---

## 📧 Contacto

Dúvidas? Abra uma Issue ou contacte o maintainer!

---

**Agradecimentos a todos que contribuem! ❤️**
