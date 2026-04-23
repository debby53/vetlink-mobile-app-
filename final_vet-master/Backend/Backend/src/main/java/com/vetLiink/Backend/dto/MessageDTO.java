package com.vetLiink.Backend.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDTO {
    private Long id;
    private Long senderId;
    private Long recipientId;
    private String content;
    private Boolean isRead;
    private String attachmentUrl;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
}
