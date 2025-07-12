import ApprovalController from '@metamask-previews/approval-controller';
import { ethers } from 'ethers';

// Инициализация контроллера
const approvalController = new ApprovalController({});

// Подключение MetaMask
async function connectMetaMask() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('MetaMask подключен');
    } catch (error) {
      console.error('Ошибка подключения MetaMask:', error);
    }
  } else {
    alert('Установите MetaMask для использования этого приложения.');
  }
}

// Запрос расходов средств
async function requestSpending(amount, recipientAddress) {
  const approvalRequest = {
    type: 'spend',
    amount,
    recipientAddress,
  };

  // Отправляем запрос на утверждение
  const approvalResponse = await approvalController.requestApproval(approvalRequest);

  if (approvalResponse.status === 'approved') {
    console.log('Транзакция утверждена!');
    return sendTransaction(amount, recipientAddress);
  } else {
    console.log('Транзакция отклонена.');
    return false;
  }
}

// Отправка транзакции
async function sendTransaction(amount, recipientAddress) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const tx = await signer.sendTransaction({
    to: recipientAddress,
    value: ethers.utils.parseEther(amount),
  });
  console.log('Транзакция отправлена:', tx.hash);
  return tx.hash;
}

// Обработка формы
document.getElementById('spendingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const amount = document.getElementById('amount').value;
  const recipient = document.getElementById('recipient').value;

  await connectMetaMask();
  const txHash = await requestSpending(amount, recipient);

  if (txHash) {
    document.getElementById('result').innerText = `Транзакция отправлена: ${txHash}`;
  } else {
    document.getElementById('result').innerText = 'Транзакция отклонена.';
  }
});
