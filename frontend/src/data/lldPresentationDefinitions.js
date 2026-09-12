/**
 * SARTHI LLD PRESENTATION DEFINITIONS
 * 
 * Technically reviewed pedagogical models, code examples, and language-specific
 * explanations for C++, Java, and Python.
 * 
 * Strictly separated from transformation logic in lldPresentationMapper.js.
 */

export const LANGUAGE_META = {
  cpp: {
    label: 'C++',
    memoryModel: 'Automatic Stack Storage Duration & Deterministic RAII',
    cleanupMechanism: 'Deterministic Destructors (`~Class()`) at Scope Exit',
    ownershipPrimitive: 'Exclusive (`std::unique_ptr`) & Shared (`std::shared_ptr`) Ownership',
    polymorphismModel: '`virtual` Member Functions & Compiler `vtable` Dispatch',
    abstractionPrimitive: 'Abstract Class with Pure Virtual Functions (`= 0`)'
  },
  java: {
    label: 'Java',
    memoryModel: 'Managed JVM Heap & Reference Reachability from GC Roots',
    cleanupMechanism: 'Deterministic Non-Memory Cleanup via `AutoCloseable` & `try-with-resources`',
    ownershipPrimitive: 'Reference Semantics with Immutability Guarantees (`final`, `record`)',
    polymorphismModel: 'Interface Contracts & Dynamic Method Dispatch (`invokevirtual`)',
    abstractionPrimitive: '`interface` (Contracts) & `abstract class` (Partial Implementations)'
  },
  python: {
    label: 'Python',
    memoryModel: 'Names Bound to Objects (Object Identity, Type & Value)',
    cleanupMechanism: 'Context Manager Protocol (`with` statement, `__enter__` / `__exit__`)',
    ownershipPrimitive: 'Reference Binding (No C++-Style Ownership; Mutability Belongs to Objects)',
    polymorphismModel: 'Dynamic Dispatch via Structural Typing (`Protocol`) & Nominal Subtyping (`ABC`)',
    abstractionPrimitive: '`typing.Protocol` (PEP 544 Structural) & `abc.ABC` (Nominal Enforcement)'
  }
};

/**
 * Pedagogical models and code examples categorized by core architectural topic.
 */
export const TOPIC_EDUCATIONAL_DEFINITIONS = {
  // Topic 1.1: Object Lifetime, Scope & Resource Ownership
  lifetime_and_scope: {
    cpp: {
      title: 'C++ Mental Model: Stack Scopes, Destructors & RAII Invariants',
      explanation: 'In C++, objects with automatic storage duration live strictly within their enclosing lexical scope `{ ... }`. When execution leaves the scope (by normal return or exception unwinding), destructors execute deterministically in reverse order of construction. Dynamic memory on the free store must be managed via RAII smart pointers (`std::unique_ptr` for exclusive single ownership). Never expose raw owning pointers across component boundaries.',
      lang: 'cpp',
      code: `// C++ RAII: Deterministic cleanup bound to object lifetime
#include <iostream>
#include <mutex>

class ScopedDatabaseLock {
private:
    std::mutex& mtx_;
    bool acquired_{false};

public:
    explicit ScopedDatabaseLock(std::mutex& mtx) : mtx_(mtx) {
        mtx_.lock();
        acquired_ = true;
        std::cout << "[LLD] Acquired database lock.\\n";
    }

    ~ScopedDatabaseLock() {
        if (acquired_) {
            mtx_.unlock();
            std::cout << "[LLD] Deterministically released lock on scope exit.\\n";
        }
    }

    // Prohibit copying to preserve single-ownership semantics
    ScopedDatabaseLock(const ScopedDatabaseLock&) = delete;
    ScopedDatabaseLock& operator=(const ScopedDatabaseLock&) = delete;
};`
    },
    java: {
      title: 'Java Mental Model: JVM Heap, Reachability & AutoCloseable Resource Guarantees',
      explanation: 'In Java, all objects reside on the managed JVM heap and variables hold object references. Memory reclamation is handled by the Garbage Collector based on reachability from GC roots (thread stacks, static references). Because garbage collection is non-deterministic, non-memory system resources (locks, sockets, file channels) must be deterministically released by implementing `AutoCloseable` and consuming instances within a `try-with-resources` block.',
      lang: 'java',
      code: `// Java: Deterministic non-memory resource management via AutoCloseable
import java.util.concurrent.locks.ReentrantLock;

public class ScopedDatabaseLock implements AutoCloseable {
    private final ReentrantLock lock;

    public ScopedDatabaseLock(ReentrantLock lock) {
        this.lock = lock;
        this.lock.lock();
        System.out.println("[LLD] Acquired database lock.");
    }

    @Override
    public void close() {
        lock.unlock();
        System.out.println("[LLD] Deterministically released lock via try-with-resources.");
    }
}`
    },
    python: {
      title: 'Python Mental Model: Name Binding, Object Mutability & Context Managers',
      explanation: 'In Python, variables are names bound to heap objects; assigning a variable rebinds a name rather than copying the object. Objects possess an identity (`id()`), a type, and a value. Mutability is an inherent property of the object itself (e.g. lists vs tuples), not the variable name. Python does not use C++-style compile-time ownership. External system resources are deterministically managed using the Context Manager protocol (`__enter__` and `__exit__`) via the `with` statement.',
      lang: 'python',
      code: `# Python: Context Manager Protocol for deterministic cleanup
import threading

class ScopedDatabaseLock:
    def __init__(self, lock: threading.Lock):
        self._lock = lock

    def __enter__(self):
        self._lock.acquire()
        print("[LLD] Acquired database lock.")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self._lock.release()
        print("[LLD] Released lock deterministically on context exit.")
        # Returning False allows any raised exception to propagate
        return False`
    }
  },

  // Topic 1.2: Encapsulation & Value Objects
  encapsulation_and_invariants: {
    cpp: {
      title: 'C++ Mental Model: Defending Class Invariants with Const-Correctness',
      explanation: 'Domain invariants are established in constructor initialization lists and protected by making internal data private. Methods that do not mutate object state must be marked `const`. Return read-only access via `const&` or immutable value copies to prevent clients from silently corrupting state.',
      lang: 'cpp',
      code: `// C++: Immutable Money Value Object with Invariant Defense
#include <string>
#include <stdexcept>

class Money {
private:
    const long amountInCents_;
    const std::string currency_;

public:
    Money(long amount, std::string currency) 
        : amountInCents_(amount), currency_(std::move(currency)) {
        if (amount < 0) throw std::invalid_argument("Amount cannot be negative");
        if (currency_.empty()) throw std::invalid_argument("Currency cannot be empty");
    }

    long getAmount() const { return amountInCents_; }
    const std::string& getCurrency() const { return currency_; }
};`
    },
    java: {
      title: 'Java Mental Model: Value Objects & Invariant Protection via Records',
      explanation: 'In Java, Value Objects have no identity and are defined purely by their attributes. Java 16+ `record` types provide shallow immutability and final fields by default. Invariants are validated in the compact constructor, and defensive copying is employed for any mutable collections.',
      lang: 'java',
      code: `// Java: Immutable Money Value Object via Record
public record Money(long amountInCents, String currency) {
    public Money {
        if (amountInCents < 0) {
            throw new IllegalArgumentException("Amount cannot be negative");
        }
        if (currency == null || currency.isBlank()) {
            throw new IllegalArgumentException("Currency must be specified");
        }
    }
}`
    },
    python: {
      title: 'Python Mental Model: Invariant Defense via Frozen Dataclasses',
      explanation: 'Value objects in Python are modeled using `@dataclass(frozen=True)`, which disables `__setattr__` after initialization to guard against unintended mutation. Invariants are verified in `__post_init__`.',
      lang: 'python',
      code: `# Python: Immutable Money Value Object
from dataclasses import dataclass

@dataclass(frozen=True)
class Money:
    amount_in_cents: int
    currency: str

    def __post_init__(self):
        if self.amount_in_cents < 0:
            raise ValueError("Amount cannot be negative")
        if not self.currency:
            raise ValueError("Currency cannot be empty")`
    }
  },

  // Generic Polymorphic Abstraction Fallback
  default_polymorphism: {
    cpp: {
      title: 'C++ Mental Model: Abstract Base Interfaces & Virtual Dispatch',
      explanation: 'Define pure virtual functions in an abstract base class (`= 0`) with a virtual destructor. Consumers depend strictly on the interface pointer, enabling runtime substitution through vtable dispatch.',
      lang: 'cpp',
      code: `// C++: Abstract Interface Contract
class ICommand {
public:
    virtual ~ICommand() = default;
    virtual void execute() = 0;
};`
    },
    java: {
      title: 'Java Mental Model: Interface Contracts & Role Segregation',
      explanation: 'Define client-focused `interface` contracts with clear method semantics. Implementations provide concrete behavior, allowing callers to adhere to the Dependency Inversion Principle.',
      lang: 'java',
      code: `// Java: Interface Contract
public interface Command {
    void execute();
}`
    },
    python: {
      title: 'Python Mental Model: Protocols & Structural Subtyping',
      explanation: 'Use `typing.Protocol` (PEP 544) for structural subtyping or `abc.ABC` for nominal enforcement. Structural subtyping allows any class implementing the required methods to be accepted without explicit inheritance.',
      lang: 'python',
      code: `# Python: Structural Protocol Contract (PEP 544)
from typing import Protocol

class Command(Protocol):
    def execute(self) -> None:
        ...`
    }
  }
};
