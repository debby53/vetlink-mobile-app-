package com.vetLiink.Backend.repository;

import com.vetLiink.Backend.entity.Call;
import com.vetLiink.Backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CallRepository extends JpaRepository<Call, Long> {
    
    // Find active calls for a user
    @Query("SELECT c FROM Call c WHERE (c.caller.id = :userId OR c.recipient.id = :userId) AND c.status IN ('initiated', 'ringing', 'connected')")
    List<Call> findActiveCalls(@Param("userId") Long userId);

    // Find incoming calls
    @Query("SELECT c FROM Call c WHERE c.recipient.id = :userId AND c.status IN ('initiated', 'ringing')")
    List<Call> findIncomingCalls(@Param("userId") Long userId);

    // Find a specific call
    Optional<Call> findByCallerAndRecipientAndStatus(User caller, User recipient, String status);

    // Find call history between two users
    @Query("SELECT c FROM Call c WHERE (c.caller.id = :userId1 AND c.recipient.id = :userId2) OR (c.caller.id = :userId2 AND c.recipient.id = :userId1) ORDER BY c.createdAt DESC")
    List<Call> findCallHistory(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    // Find missed calls
    @Query("SELECT c FROM Call c WHERE c.recipient.id = :userId AND c.status = 'missed' ORDER BY c.createdAt DESC")
    List<Call> findMissedCalls(@Param("userId") Long userId);

    // Find recent calls for a user
    @Query("SELECT c FROM Call c WHERE (c.caller.id = :userId OR c.recipient.id = :userId) ORDER BY c.createdAt DESC LIMIT :limit")
    List<Call> findRecentCalls(@Param("userId") Long userId, @Param("limit") int limit);

    // Find calls initiated after a certain time
    List<Call> findByInitiatedAtAfter(LocalDateTime time);

    void deleteByCallerIdOrRecipientId(Long callerId, Long recipientId);
}
