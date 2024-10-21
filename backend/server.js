const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const context = {};

function getOptionsMessage() {
  return `Por favor, escolha uma das opções abaixo:
1. Suporte Técnico
2. Financeiro
3. Comercial
4. Recursos Humanos
5. Vendas
6. Informações Gerais`;
}

// Função para gerar respostas do Suporte Técnico
function getSupportResponse(message) {
  if (message.toLowerCase().includes('problema') || message.toLowerCase().includes('erro')) {
    return 'Sinto muito por isso! Você pode me descrever o problema que está enfrentando?';
  } else if (message.toLowerCase().includes('atualização')) {
    return 'Para atualizações, você pode verificar o nosso portal de atualizações ou me perguntar sobre um tópico específico.';
  } else if (message.toLowerCase().includes('ajuda')) {
    return 'Claro! Estou aqui para ajudar. Qual é a sua dúvida específica?';
  }
  return 'Se você precisa de suporte técnico, por favor, descreva seu problema ou pergunta.';
}

// Função para gerar respostas do Financeiro
function getFinanceResponse(message) {
  if (message.toLowerCase().includes('fatura') || message.toLowerCase().includes('conta')) {
    return 'Você pode acessar sua conta online para verificar suas faturas ou me dar mais detalhes sobre a fatura que você precisa.';
  } else if (message.toLowerCase().includes('pagamento')) {
    return 'Para questões de pagamento, por favor, forneça o seu número de conta ou o que você gostaria de saber.';
  } else if (message.toLowerCase().includes('reembolso')) {
    return 'Para solicitar um reembolso, você pode enviar um email para nosso departamento financeiro ou me dar mais informações para que eu possa ajudá-lo.';
  }
  return 'Se você precisa de assistência financeira, por favor, descreva sua dúvida.';
}

// Função para gerar respostas do Comercial
function getCommercialResponse(message) {
  if (message.toLowerCase().includes('produto') || message.toLowerCase().includes('serviço')) {
    return 'Temos uma variedade de produtos e serviços! Você pode me dizer qual área ou produto específico você está interessado?';
  } else if (message.toLowerCase().includes('preço') || message.toLowerCase().includes('custo')) {
    return 'Para informações sobre preços, por favor, me diga qual produto ou serviço você gostaria de saber mais.';
  } else if (message.toLowerCase().includes('contrato')) {
    return 'Para questões contratuais, por favor, forneça mais detalhes para que eu possa ajudar da melhor forma.';
  }
  return 'Se você precisa de assistência comercial, por favor, descreva sua dúvida.';
}

// Função para gerar respostas de Recursos Humanos
function getHRResponse(message) {
  if (message.toLowerCase().includes('contratação') || message.toLowerCase().includes('vaga')) {
    return 'Estamos sempre em busca de novos talentos! Você pode conferir nossas vagas disponíveis em nosso site.';
  } else if (message.toLowerCase().includes('benefícios')) {
    return 'Oferecemos diversos benefícios aos nossos colaboradores, como plano de saúde, vale-refeição e muito mais. Você gostaria de saber sobre algum benefício específico?';
  } else if (message.toLowerCase().includes('treinamento')) {
    return 'Temos programas de treinamento e desenvolvimento para nossos funcionários. Você gostaria de saber mais sobre isso?';
  }
  return 'Se você precisa de assistência em Recursos Humanos, por favor, descreva sua dúvida.';
}

// Função para gerar respostas de Vendas
function getSalesResponse(message) {
  if (message.toLowerCase().includes('orçamento')) {
    return 'Para solicitar um orçamento, por favor, me informe os detalhes do que você precisa.';
  } else if (message.toLowerCase().includes('desconto')) {
    return 'Oferecemos descontos especiais em alguns produtos. Você gostaria de saber sobre alguma promoção específica?';
  } else if (message.toLowerCase().includes('comprar')) {
    return 'Para efetuar uma compra, por favor, forneça os detalhes do produto que você deseja adquirir.';
  }
  return 'Se você precisa de assistência em Vendas, por favor, descreva sua dúvida.';
}

// Função para gerar respostas de Informações Gerais
function getGeneralInfoResponse(message) {
  if (message.toLowerCase().includes('localização') || message.toLowerCase().includes('endereço')) {
    return 'Estamos localizados na Avenida Central, 123, Centro. Você gostaria de saber mais sobre como chegar até aqui?';
  } else if (message.toLowerCase().includes('horário de funcionamento')) {
    return 'Nosso horário de funcionamento é de segunda a sexta, das 8h às 18h.';
  } else if (message.toLowerCase().includes('contato')) {
    return 'Você pode entrar em contato conosco pelo telefone (81) 1234-5678 ou pelo e-mail contato@empresa.com.';
  }
  return 'Se você precisa de informações gerais, por favor, descreva sua dúvida.';
}

// Função para lidar com o encerramento do chat
function handleEndChat(userContext, chatId) {
  const message = `Obrigado por utilizar nosso chat, ${userContext.name}. Estamos à disposição para ajudá-lo no futuro!`;
  
  // Limpa o contexto do usuário para iniciar um novo chat
  delete context[chatId];
  
  return message;
}

// Rota para receber mensagens
app.post('/chat', (req, res) => {
  const message = req.body.message;
  const chatId = req.body.chatId;
  const userContext = context[chatId] || { name: '', history: [], lastOption: '' };

  // Adiciona a mensagem ao histórico
  userContext.history.push({ user: message });

  let response;

  // Verifica se o usuário disse "Obrigada" para verificar se precisa de mais ajuda
  if (message.toLowerCase().includes('obrigada') || message.toLowerCase().includes('obrigado')) {
    response = 'Você precisa de mais ajuda? (Sim/Não)';
    userContext.awaitingHelpConfirmation = true;
  } else if (userContext.awaitingHelpConfirmation) {
    if (message.toLowerCase() === 'sim') {
      response = 'Por favor, escolha uma das opções abaixo:\n' + getOptionsMessage();
    } else if (message.toLowerCase() === 'não') {
      response = handleEndChat(userContext, chatId);
      // Retorna cedo para finalizar a interação
      return res.json({ response });
    } else {
      response = 'Não entendi sua resposta. Você precisa de mais ajuda? (Sim/Não)';
    }
    userContext.awaitingHelpConfirmation = false;
  } else if (message.toLowerCase().includes('oi') || message.toLowerCase().includes('olá')) {
    response = 'Olá! Qual é o seu nome?';
  } else if (!userContext.name) {
    const name = message.trim();
    if (name) {
      userContext.name = name;
      response = `Prazer em te conhecer, ${userContext.name}! Agora, escolha uma das opções:\n` + getOptionsMessage();
    } else {
      response = 'Desculpe, não consegui entender seu nome. Você pode me dizer novamente?';
    }
  } else if (userContext.lastOption === '') {
    const optionMap = {
      '1': 'suporte técnico',
      '2': 'financeiro',
      '3': 'comercial',
      '4': 'recursos humanos',
      '5': 'vendas',
      '6': 'informações gerais',
      'suporte técnico': 'suporte técnico',
      'financeiro': 'financeiro',
      'comercial': 'comercial',
      'recursos humanos': 'recursos humanos',
      'vendas': 'vendas',
      'informações gerais': 'informações gerais',
    };

    const lowerCaseMessage = message.toLowerCase();
    const selectedOption = optionMap[lowerCaseMessage];

    if (selectedOption) {
      userContext.lastOption = selectedOption;
      response = `Transferindo para a fila de ${selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)}. Como posso ajudá-lo?`;
    } else {
      response = 'Por favor, escolha uma das opções:\n' + getOptionsMessage();
    }
  } else if (userContext.lastOption === 'suporte técnico') {
    response = getSupportResponse(message);
  } else if (userContext.lastOption === 'financeiro') {
    response = getFinanceResponse(message);
  } else if (userContext.lastOption === 'comercial') {
    response = getCommercialResponse(message);
  } else if (userContext.lastOption === 'recursos humanos') {
    response = getHRResponse(message);
  } else if (userContext.lastOption === 'vendas') {
    response = getSalesResponse(message);
  } else if (userContext.lastOption === 'informações gerais') {
    response = getGeneralInfoResponse(message);
  } else {
    response = 'Não entendi, por gentileza escolha uma das opções:\n' + getOptionsMessage();
  }

  userContext.history.push({ bot: response });
  context[chatId] = userContext;

  res.json({ response });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
