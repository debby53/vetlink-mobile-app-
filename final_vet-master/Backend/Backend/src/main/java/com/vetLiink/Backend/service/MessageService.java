package com.vetLiink.Backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.vetLiink.Backend.dto.MessageDTO;
import com.vetLiink.Backend.entity.Message;
import com.vetLiink.Backend.entity.User;
import com.vetLiink.Backend.repository.MessageRepository;
import com.vetLiink.Backend.repository.UserRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public MessageDTO sendMessage(MessageDTO messageDTO) {
        User sender = userRepository.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User recipient = userRepository.findById(messageDTO.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        Message message = Message.builder()
                .sender(sender)
                .recipient(recipient)
                .content(messageDTO.getContent())
                .attachmentUrl(messageDTO.getAttachmentUrl())
                .isRead(false)
                .build();

        Message savedMessage = messageRepository.save(message);
        
        // Trigger notification for the recipient
        String notificationTitle = "New Message from " + sender.getName();
        String notificationMessage = messageDTO.getContent().length() > 100 
                ? messageDTO.getContent().substring(0, 100) + "..." 
                : messageDTO.getContent();
        
        notificationService.createNotification(
                recipient.getId(),
                notificationTitle,
                notificationMessage,
                "INFO"
        );
        
        return convertToDTO(savedMessage);
    }

    public List<MessageDTO> getConversation(Long userId1, Long userId2) {
        List<MessageDTO> sentMessages = messageRepository.findBySenderIdAndRecipientIdOrderByCreatedAtDesc(userId1, userId2).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        List<MessageDTO> receivedMessages = messageRepository.findBySenderIdAndRecipientIdOrderByCreatedAtDesc(userId2, userId1).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        // Combine and sort all messages by created date
        sentMessages.addAll(receivedMessages);
        sentMessages.sort((a, b) -> {
            if (a.getCreatedAt() == null || b.getCreatedAt() == null) return 0;
            return a.getCreatedAt().compareTo(b.getCreatedAt());
        });
        
        return sentMessages;
    }

    public List<MessageDTO> getInboxMessages(Long userId) {
        return messageRepository.findBySenderIdOrRecipientIdOrderByCreatedAtDesc(userId, userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<MessageDTO> getUnreadMessages(Long userId) {
        return messageRepository.findByRecipientIdAndIsReadFalse(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public MessageDTO markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setIsRead(true);
        message.setReadAt(LocalDateTime.now());
        Message updatedMessage = messageRepository.save(message);
        return convertToDTO(updatedMessage);
    }

    public MessageDTO updateMessage(Long messageId, MessageDTO messageDTO) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setContent(messageDTO.getContent());
        message.setUpdatedAt(LocalDateTime.now());
        Message updatedMessage = messageRepository.save(message);
        return convertToDTO(updatedMessage);
    }

    public void deleteMessage(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        messageRepository.delete(message);
    }

    private MessageDTO convertToDTO(Message message) {
        return MessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .recipientId(message.getRecipient().getId())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .attachmentUrl(message.getAttachmentUrl())
                .createdAt(message.getCreatedAt())
                .readAt(message.getReadAt())
                .build();
    }
}
