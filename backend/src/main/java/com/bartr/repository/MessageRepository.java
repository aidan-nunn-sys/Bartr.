package com.bartr.repository;

import com.bartr.model.entity.Message;
import com.bartr.model.entity.Match;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByMatchOrderByCreatedAtDesc(Match match);
}