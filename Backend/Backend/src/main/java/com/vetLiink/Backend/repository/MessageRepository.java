package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderIdOrRecipientIdOrderByCreatedAtDesc(Long senderId, Long recipientId);
    List<Message> findByRecipientIdAndIsReadFalse(Long recipientId);
    List<Message> findBySenderIdAndRecipientIdOrderByCreatedAtDesc(Long senderId, Long recipientId);
}
